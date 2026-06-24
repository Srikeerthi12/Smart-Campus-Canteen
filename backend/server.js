require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const authRoutes = require('./routes/auth');
const canteenRoutes = require('./routes/canteen');
const menuRoutes = require('./routes/menu');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const connectDB = require('./config/database');
const app = express()

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://smart-campus-canteen-three.vercel.app"
    ],
    credentials: true
}));
app.use(express.json())

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' })
});
app.use('/api/auth', authRoutes);
app.use('/api/canteens', canteenRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
}); 