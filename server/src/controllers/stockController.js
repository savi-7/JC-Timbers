import Stock from "../models/Stock.js";

// Create new stock item
export const createStock = async (req, res) => {
  try {
    const {
      name,
      category,
      quantity,
      unit,
      attributes
    } = req.body;

    // Validate required fields
    if (!name || !category || !unit) {
      return res.status(400).json({ 
        message: "Name, category, and unit are required" 
      });
    }

    // Check if stock item already exists
    const existingStock = await Stock.findOne({ 
      name: name.trim(),
      category: category.trim()
    });

    if (existingStock) {
      return res.status(400).json({ 
        message: "Stock item with this name and category already exists" 
      });
    }

    const stock = new Stock({
      name: name.trim(),
      category: category.trim(),
      quantity: quantity ? parseFloat(quantity) : 0,
      unit: unit.trim(),
      attributes: attributes || {}
    });

    await stock.save();

    res.status(201).json({
      message: "Stock item created successfully",
      stock: {
        id: stock._id,
        name: stock.name,
        category: stock.category,
        quantity: stock.quantity,
        unit: stock.unit,
        attributes: stock.attributes,
        createdAt: stock.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating stock:', error);
    res.status(500).json({ message: "Failed to create stock item", error: error.message });
  }
};

// Get all stock items with filtering and pagination
export const getAllStock = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Search by name
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const stockItems = await Stock.find(query)
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const total = await Stock.countDocuments(query);

    // Get stock statistics
    const stats = await Stock.aggregate([
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lt: ['$quantity', 5] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.json({
      stockItems,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      stats: stats[0] || {
        totalItems: 0,
        totalQuantity: 0,
        lowStockCount: 0
      }
    });
  } catch (error) {
    console.error('Error fetching stock:', error);
    res.status(500).json({ message: "Failed to fetch stock items", error: error.message });
  }
};

// Get stock item by ID
export const getStockById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const stock = await Stock.findById(id).select('-__v');
    if (!stock) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    res.json({ stock });
  } catch (error) {
    console.error('Error fetching stock item:', error);
    res.status(500).json({ message: "Failed to fetch stock item", error: error.message });
  }
};

// Update stock item
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Convert numeric fields
    if (updateData.quantity) {
      updateData.quantity = parseFloat(updateData.quantity);
    }

    const stock = await Stock.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-__v');

    if (!stock) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    res.json({
      message: "Stock item updated successfully",
      stock: {
        id: stock._id,
        name: stock.name,
        category: stock.category,
        quantity: stock.quantity,
        unit: stock.unit,
        attributes: stock.attributes,
        updatedAt: stock.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating stock:', error);
    res.status(500).json({ message: "Failed to update stock item", error: error.message });
  }
};

// Delete stock item
export const deleteStock = async (req, res) => {
  try {
    const { id } = req.params;

    const stock = await Stock.findByIdAndDelete(id);
    if (!stock) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    res.json({ message: "Stock item deleted successfully" });
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ message: "Failed to delete stock item", error: error.message });
  }
};

// Get low stock items
export const getLowStockItems = async (req, res) => {
  try {
    const lowStockItems = await Stock.find({
      quantity: { $lt: 5 }
    }).sort({ quantity: 1 }).select('-__v');

    res.json({ lowStockItems });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    res.status(500).json({ message: "Failed to fetch low stock items", error: error.message });
  }
};

// Update stock quantity (for inventory adjustments)
export const updateStockQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'

    if (!quantity && quantity !== 0) {
      return res.status(400).json({ message: "Quantity is required" });
    }

    const stock = await Stock.findById(id);
    if (!stock) {
      return res.status(404).json({ message: "Stock item not found" });
    }

    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = stock.quantity + parseFloat(quantity);
        break;
      case 'subtract':
        newQuantity = stock.quantity - parseFloat(quantity);
        break;
      case 'set':
      default:
        newQuantity = parseFloat(quantity);
        break;
    }

    if (newQuantity < 0) {
      return res.status(400).json({ message: "Quantity cannot be negative" });
    }

    stock.quantity = newQuantity;
    await stock.save();

    res.json({
      message: "Stock quantity updated successfully",
      stock: {
        id: stock._id,
        productName: stock.productName,
        quantity: stock.quantity,
        status: stock.status,
        updatedAt: stock.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    res.status(500).json({ message: "Failed to update stock quantity", error: error.message });
  }
};
