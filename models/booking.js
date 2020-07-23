const mongoose = require('mongoose');

var bookingSchema = mongoose.Schema({
    name: String,
    roomType: String,
    date: String,
    amount: String
});

module.exports = mongoose.model("Booking", bookingSchema);