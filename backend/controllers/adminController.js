const User = require('../models/User');
const Canteen = require('../models/Canteen');
const bcrypt = require('bcryptjs');

const createCanteenOwner = async (req, res) => {
    try {
        const { name, email, password, canteenId } = req.body;

        if (!name || !email || !password || !canteenId) {
            return res.status(400).json({ message: 'All fields (name, email, password, canteenId) are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const canteen = await Canteen.findById(canteenId);
        if (!canteen) {
            return res.status(404).json({ message: 'Canteen not found' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const owner = new User({
            name,
            email,
            password: hashedPassword,
            role: 'canteenOwner',
            canteenId
        });

        await owner.save();
        
        // Also update the canteen to reference this owner
        canteen.ownerId = owner._id;
        await canteen.save();

        res.status(201).json({ message: 'Canteen owner created successfully', ownerId: owner._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error while creating canteen owner', error: err.message });
    }
};

const getCanteenOwners = async (req, res) => {
    try {
        const owners = await User.find({ role: 'canteenOwner' })
            .populate('canteenId', 'name location');
        res.status(200).json({ owners });
    } catch (err) {
        res.status(500).json({ message: 'Server error fetching owners', error: err.message });
    }
};

module.exports = {
    createCanteenOwner,
    getCanteenOwners
};
