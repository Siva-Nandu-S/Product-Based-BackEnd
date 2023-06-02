const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    userName: {
        type: 'string',
        required: true
    },
    amount: {
        type: 'number',
        required: true,
        min: 0
    },
    dateOfPurchase: {
        type: 'date',
        required: true
    }
});

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;