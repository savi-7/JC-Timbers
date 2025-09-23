import Address from '../models/Address.js';
import User from '../models/User.js';

// Get all addresses for a user
const getUserAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addresses' });
  }
};

// Add new address
const addAddress = async (req, res) => {
  try {
    const { fullName, mobileNumber, pincode, state, address, city, landmark, isDefault, addressType } = req.body;

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await Address.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const newAddress = new Address({
      userId: req.user.id,
      fullName,
      mobileNumber,
      pincode,
      state,
      address,
      city,
      landmark,
      isDefault: isDefault || false,
      addressType: addressType || 'home'
    });

    await newAddress.save();
    res.status(201).json({ success: true, message: 'Address added successfully', address: newAddress });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Failed to add address' });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, mobileNumber, pincode, state, address, city, landmark, isDefault, addressType } = req.body;

    const existingAddress = await Address.findOne({ _id: id, userId: req.user.id });
    if (!existingAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault && !existingAddress.isDefault) {
      await Address.updateMany({ userId: req.user.id, _id: { $ne: id } }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      id,
      {
        fullName,
        mobileNumber,
        pincode,
        state,
        address,
        city,
        landmark,
        isDefault,
        addressType
      },
      { new: true }
    );

    res.json({ success: true, message: 'Address updated successfully', address: updatedAddress });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await Address.findByIdAndDelete(id);
    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Failed to delete address' });
  }
};

// Set default address
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({ _id: id, userId: req.user.id });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Remove default from all addresses
    await Address.updateMany({ userId: req.user.id }, { isDefault: false });

    // Set this address as default
    await Address.findByIdAndUpdate(id, { isDefault: true });

    res.json({ success: true, message: 'Default address updated successfully' });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Failed to set default address' });
  }
};

export {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
};
