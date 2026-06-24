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