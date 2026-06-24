const Canteen = require('../models/Canteen');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// get all canteens
const getAllCanteens = async (req, res) => {
    try {
        const canteens = await Canteen.find();
        res.status(200).json(canteens);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching canteens' });
    }
};

// get canteen by id
const getCanteenById = async (req, res) => {
    try {
        const { id } = req.params;
        const canteen = await Canteen.findById(id);
        if (!canteen) {
            return res.status(404).json({ message: 'Canteen not found' });
        }
        res.status(200).json(canteen);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching canteen' });
    }
};

// create new canteen
const createCanteen = async (req, res) => {
    try {
        const {name, location, openTime, closeTime, contactPhone, imageUrl, ownerName, ownerEmail, ownerPassword} = req.body;
        if (!name || !location || !openTime || !closeTime || !contactPhone) {
            return res.status(400).json({ message: 'All canteen fields are required' });
        }

        // If owner details are provided, verify email isn't taken before creating canteen
        if (ownerEmail) {
            const existingUser = await User.findOne({ email: ownerEmail });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
        }

        const canteen = new Canteen({ name, location, openTime, closeTime, contactPhone, imageUrl });
        await canteen.save();

        let owner = null;
        if (ownerName && ownerEmail && ownerPassword) {
            const hashedPassword = await bcrypt.hash(ownerPassword, 10);
            owner = new User({
                name: ownerName,
                email: ownerEmail,
                password: hashedPassword,
                role: 'canteenOwner',
                canteenId: canteen._id
            });
            await owner.save();

            canteen.ownerId = owner._id;
            await canteen.save();
        }

        res.status(201).json({ message: 'Canteen created successfully', canteen, owner });
    } catch (err) {
        res.status(500).json({ message: 'Error creating canteen' });
    }
};

// update canteen
const updateCanteen = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.user.role === 'canteenOwner' && req.user.canteenId.toString() !== id) {
            return res.status(403).json({ message: 'You can only update your own canteen' });
        }

        const updates = req.body;
        const canteen = await Canteen.findByIdAndUpdate(id, updates, { new: true });
        if (!canteen) {
            return res.status(404).json({ message: 'Canteen not found' });
        }
        res.status(200).json({ message: 'Canteen updated successfully', canteen });
    } catch (err) {
        res.status(500).json({ message: 'Error updating canteen' });
    }
};

// delete canteen
const deleteCanteen = async (req, res) => {
    try {
        const { id } = req.params;
        const canteen = await Canteen.findByIdAndDelete(id);
        if (!canteen) {
            return res.status(404).json({ message: 'Canteen not found' });
        }
        // Also delete associated menu items
        await MenuItem.deleteMany({ canteen: id });
        res.status(200).json({ message: 'Canteen and associated menu items deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting canteen' });
    }
}

module.exports = {
    getAllCanteens,
    getCanteenById,
    createCanteen,
    updateCanteen,
    deleteCanteen
};
