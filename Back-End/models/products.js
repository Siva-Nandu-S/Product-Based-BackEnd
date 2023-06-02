const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: 'string',
        required: true
    },
    price: {
        type: 'number',
        required: true,
        min: 0
    },
    category: {
        type: 'string',
        required: true
    },
    stock: {
        type: 'number',
        required: true,
        min: 0
    }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;