const mongoose = require('mongoose');
const { Schema } = mongoose;

const CanteenSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    openTime: {
        type: String,
        required: true,
    },
    closeTime: {
        type: String,
        required: true,
    },
    contactPhone: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
        default: '',
    },
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Canteen = mongoose.model('Canteen', CanteenSchema);

module.exports = Canteen;