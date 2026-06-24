const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const changePassword = async () => {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('\n❌ Missing arguments!');
        console.log('Usage: node changePassword.js <email> <new_password>\n');
        process.exit(1);
    }

    const [email, newPassword] = args;

    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');

        const user = await User.findOne({ email });
        if (!user) {
            console.log(`\n❌ User with email "${email}" not found.\n`);
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        console.log(`\n✅ Password updated successfully for: ${email}`);
        console.log(`New Password: ${newPassword}\n`);
        process.exit(0);
    } catch (err) {
        console.error('Error changing password:', err);
        process.exit(1);
    }
};

changePassword();
