const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true }
});

const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
