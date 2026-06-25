const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [{
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    }],
    canteenId: {
        type: Schema.Types.ObjectId,
        ref: 'Canteen',
        required: true,
    },
    // Denormalized canteen info — stays readable even if the Canteen doc is deleted later
    canteenSnapshot: {
        name:         { type: String, default: '' },
        location:     { type: String, default: '' },
        contactPhone: { type: String, default: '' },
    },
    // Denormalized user info — stays readable even if the User doc is deleted/re-seeded later
    userSnapshot: {
        name:  { type: String, default: '' },
        email: { type: String, default: '' },
    },
    quantities: [Number],
    total: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
        default: 'pending',
    },
    specialInstructions: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;