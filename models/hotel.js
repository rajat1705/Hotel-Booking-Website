var mongoose = require("mongoose");

//SCHEMA SETUP
var hotelSchema = new mongoose.Schema({
	name: String,
	image: String,
	image2: String,
	image3: String,
	description: String, 
	price: String,
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Hotel", hotelSchema);
