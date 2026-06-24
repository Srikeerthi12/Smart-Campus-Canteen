const MenuItem = require('../models/MenuItem');
const Canteen = require('../models/Canteen');
const authMiddleware = require('../middleware/auth');


// Get all menu items
const getAllMenuItems = async (req, res) => {
  try {
    const menuItems = await MenuItem.find().populate('canteen');
    res.status(200).json({ menuItems });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu items' });
  }
};

// Get menu items by canteen
const getMenuItemsByCanteen = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const menuItems = await MenuItem.find({ canteen: canteenId });
    if (menuItems.length === 0) {
      return res.status(404).json({ message: 'No items found for this canteen' });
    }
    res.status(200).json({ menuItems });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu items' });
  }
};

// Get single menu item
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findById(id).populate('canteen');
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.status(200).json({ menuItem });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching menu item' });
  }
};

// Create menu item
const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, imageUrl, canteen } = req.body;

    if (!name || !description || !price || !canteen) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    if (req.user.role === 'canteenOwner' && req.user.canteenId.toString() !== canteen.toString()) {
      return res.status(403).json({ message: 'You can only add items to your own canteen' });
    }

    if (price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    const menuItem = new MenuItem({
      name,
      description,
      price,
      imageUrl,
      canteen
    });

    await menuItem.save();
    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem
    });
  } catch (err) {
    res.status(500).json({ message: 'Error creating menu item' });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate price if provided
    if (updates.price && updates.price <= 0) {
      return res.status(400).json({ message: 'Price must be greater than 0' });
    }

    const itemToUpdate = await MenuItem.findById(id);
    if (!itemToUpdate) {
        return res.status(404).json({ message: 'Menu item not found' });
    }
    
    if (req.user.role === 'canteenOwner' && req.user.canteenId.toString() !== itemToUpdate.canteen.toString()) {
        return res.status(403).json({ message: 'You can only update items in your own canteen' });
    }

    const menuItem = await MenuItem.findByIdAndUpdate(id, updates, { new: true });
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (err) {
    res.status(500).json({ message: 'Error updating menu item' });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const itemToDelete = await MenuItem.findById(id);
    if (!itemToDelete) {
        return res.status(404).json({ message: 'Menu item not found' });
    }

    if (req.user.role === 'canteenOwner' && req.user.canteenId.toString() !== itemToDelete.canteen.toString()) {
        return res.status(403).json({ message: 'You can only delete items in your own canteen' });
    }

    const menuItem = await MenuItem.findByIdAndDelete(id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json({ message: 'Menu item deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting menu item' });
  }
};

module.exports = {
  getAllMenuItems,
  getMenuItemsByCanteen,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};