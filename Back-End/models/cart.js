const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    product_name: {
        type: 'string',
        required: true
    },
    price: {
        type: 'number',
        required: true,
        min: 0
    },
    username: {
        type: 'string',
        required: true,
    },
    product_id: {
        type: 'string',
        required: true
    },
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;