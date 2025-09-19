import Vendor from "../models/Vendor.js";
import WoodIntake from "../models/WoodIntake.js";

// Create a new vendor
export const createVendor = async (req, res) => {
  try {
    const {
      name,
      contact,
      businessDetails
    } = req.body;

    // Check if vendor with same email already exists (only if email is provided)
    if (contact.email) {
      const existingVendor = await Vendor.findOne({ 'contact.email': contact.email });
      if (existingVendor) {
        return res.status(400).json({ message: "Vendor with this email already exists" });
      }
    }

    const vendor = new Vendor({
      name,
      contact,
      businessDetails
    });

    await vendor.save();

    res.status(201).json({
      message: "Vendor created successfully",
      vendor: {
        id: vendor._id,
        name: vendor.name,
        contact: vendor.contact,
        businessDetails: vendor.businessDetails,
        status: vendor.status,
        createdAt: vendor.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating vendor:', error);
    res.status(500).json({ message: "Failed to create vendor", error: error.message });
  }
};

// Get all vendors
export const getAllVendors = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    // Build query
    let query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } }
      ].filter(condition => {
        // Only include email search if email field exists
        if (condition['contact.email']) {
          return true;
        }
        return true;
      });
    }

    const vendors = await Vendor.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Vendor.countDocuments(query);

    res.json({
      vendors,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching vendors:', error);
    res.status(500).json({ message: "Failed to fetch vendors", error: error.message });
  }
};

// Get vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vendor = await Vendor.findById(id).select('-__v');
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Get recent wood intakes for this vendor
    const recentIntakes = await WoodIntake.find({ vendorId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('vendorId', 'name contact.email')
      .select('-__v');

    res.json({
      vendor,
      recentIntakes
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({ message: "Failed to fetch vendor", error: error.message });
  }
};

// Update vendor
export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({
      message: "Vendor updated successfully",
      vendor
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({ message: "Failed to update vendor", error: error.message });
  }
};

// Delete vendor
export const deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if vendor has any wood intakes
    const intakes = await WoodIntake.find({ vendorId: id });
    if (intakes.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete vendor with existing wood intakes. Please archive instead." 
      });
    }

    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.json({ message: "Vendor deleted successfully" });
  } catch (error) {
    console.error('Error deleting vendor:', error);
    res.status(500).json({ message: "Failed to delete vendor", error: error.message });
  }
};

// Create wood intake
export const createWoodIntake = async (req, res) => {
  try {
    const {
      vendorId,
      woodDetails,
      costDetails,
      logistics,
      notes
    } = req.body;

    console.log('Wood intake request data:', {
      vendorId,
      woodDetails,
      costDetails,
      logistics
    });

    // Validate required fields
    if (!vendorId) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    if (!woodDetails?.dimensions?.length || !woodDetails?.dimensions?.width || 
        !woodDetails?.dimensions?.thickness || !woodDetails?.dimensions?.quantity) {
      return res.status(400).json({ message: "All wood dimensions are required" });
    }

    if (!costDetails?.unitPrice) {
      return res.status(400).json({ message: "Unit price is required" });
    }

    if (!logistics?.deliveryDate) {
      return res.status(400).json({ message: "Delivery date is required" });
    }

    // Convert string values to numbers
    const processedWoodDetails = {
      ...woodDetails,
      dimensions: {
        length: parseFloat(woodDetails.dimensions.length),
        width: parseFloat(woodDetails.dimensions.width),
        thickness: parseFloat(woodDetails.dimensions.thickness),
        quantity: parseInt(woodDetails.dimensions.quantity)
      }
    };

    const processedCostDetails = {
      ...costDetails,
      unitPrice: parseFloat(costDetails.unitPrice)
    };

    const processedLogistics = {
      ...logistics,
      deliveryDate: new Date(logistics.deliveryDate)
    };

    // Verify vendor exists
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const woodIntake = new WoodIntake({
      vendorId,
      woodDetails: processedWoodDetails,
      costDetails: processedCostDetails,
      logistics: processedLogistics,
      notes
    });

    console.log('WoodIntake object before save:', {
      woodDetails: woodIntake.woodDetails,
      costDetails: woodIntake.costDetails
    });

    await woodIntake.save();

    // Update vendor's total intake
    await Vendor.findByIdAndUpdate(vendorId, {
      $inc: {
        'totalIntake.count': 1,
        'totalIntake.value': woodIntake.costDetails.totalCost
      }
    });

    // Populate vendor details for response
    await woodIntake.populate('vendorId', 'name contact.email');

    res.status(201).json({
      message: "Wood intake logged successfully",
      woodIntake: {
        id: woodIntake._id,
        vendor: woodIntake.vendorId,
        woodDetails: woodIntake.woodDetails,
        costDetails: woodIntake.costDetails,
        logistics: woodIntake.logistics,
        status: woodIntake.status,
        createdAt: woodIntake.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating wood intake:', error);
    res.status(500).json({ message: "Failed to log wood intake", error: error.message });
  }
};

// Get all wood intakes
export const getAllWoodIntakes = async (req, res) => {
  try {
    const { page = 1, limit = 10, vendorId, status, woodType } = req.query;
    
    // Build query
    let query = {};
    
    if (vendorId) {
      query.vendorId = vendorId;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (woodType) {
      query['woodDetails.type'] = woodType;
    }

    const woodIntakes = await WoodIntake.find(query)
      .populate('vendorId', 'name contact.email')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await WoodIntake.countDocuments(query);

    res.json({
      woodIntakes,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching wood intakes:', error);
    res.status(500).json({ message: "Failed to fetch wood intakes", error: error.message });
  }
};

// Update wood intake status
export const updateWoodIntakeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user.id; // From JWT

    const updateData = {
      status,
      verifiedBy: userId,
      verifiedAt: new Date()
    };

    if (notes) {
      updateData.notes = notes;
    }

    const woodIntake = await WoodIntake.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('vendorId', 'name contact.email')
     .populate('verifiedBy', 'name')
     .select('-__v');

    if (!woodIntake) {
      return res.status(404).json({ message: "Wood intake not found" });
    }

    res.json({
      message: "Wood intake status updated successfully",
      woodIntake
    });
  } catch (error) {
    console.error('Error updating wood intake:', error);
    res.status(500).json({ message: "Failed to update wood intake", error: error.message });
  }
};

// Get vendor statistics
export const getVendorStats = async (req, res) => {
  try {
    const totalVendors = await Vendor.countDocuments();
    const activeVendors = await Vendor.countDocuments({ status: 'active' });
    
    const totalIntakes = await WoodIntake.countDocuments();
    const pendingIntakes = await WoodIntake.countDocuments({ status: 'pending' });
    
    const totalValue = await WoodIntake.aggregate([
      { $group: { _id: null, total: { $sum: '$costDetails.totalCost' } } }
    ]);

    const topVendors = await Vendor.find()
      .sort({ 'totalIntake.value': -1 })
      .limit(5)
      .select('name totalIntake contact.email');

    res.json({
      totalVendors,
      activeVendors,
      totalIntakes,
      pendingIntakes,
      totalValue: totalValue[0]?.total || 0,
      topVendors
    });
  } catch (error) {
    console.error('Error fetching vendor stats:', error);
    res.status(500).json({ message: "Failed to fetch vendor statistics", error: error.message });
  }
};
