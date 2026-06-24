const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');

        const existingAdmin = await User.findOne({ email: 'superadmin@campuseats.com' });
        if (existingAdmin) {
            console.log('Super Admin already exists.');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const superAdmin = new User({
            name: 'Super Administrator',
            email: 'superadmin@campuseats.com',
            password: hashedPassword,
            role: 'superAdmin',
        });

        await superAdmin.save();
        console.log('✅ Super Admin seeded successfully!');
        console.log('Email: superadmin@campuseats.com');
        console.log('Password: admin123');
        process.exit(0);

    } catch (err) {
        console.error('Error seeding Super Admin:', err);
        process.exit(1);
    }
};

seedSuperAdmin();
