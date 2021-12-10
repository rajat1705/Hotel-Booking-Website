var express = require('express');
var router = express.Router();
var Hotel = require('../models/hotel');
var middleware = require('../middleware')

//INDEX - show all hotel
router.get("/hotels", function(req, res){
	Hotel.find({}, function(err, allHotels){
		if(err)
			console.log(err);
		else
			res.render("hotels/index.ejs", {hotels: allHotels});
	});
});

//CREATE - add new hotel to DB
router.post("/hotels", middleware.checkHotelOwnership, function(req, res){
	var name = req.body.name;
	var image = req.body.image;
	var image2 = req.body.image2;
	var image3 = req.body.image3;
	var desc = req.body.description;
	var price = req.body.price;
	var newHotel = {name: name, image: image, image2: image2, image3: image3, description: desc, price: price};
	//Create a new hotel and save it to DB
	Hotel.create(newHotel, function(err, newlyCreated){
		if(err)
			console.log(err);
		else 
			res.redirect("/hotels");	
	});
});

//NEW - show form to create new hotel
router.get("/hotels/new", middleware.checkHotelOwnership, function(req, res){
	res.render("hotels/new.ejs");
});

//SHOW - shows more info about one hotel
router.get("/hotels/:id", function(req, res){
	Hotel.findById(req.params.id).populate("comments").exec(function(err, foundHotel){
		if(err || !foundHotel){
			req.flash("error", "Hotel not found");
			res.redirect("back");
		} else{
			res.render("hotels/show.ejs", {hotel: foundHotel, google_api_key: process.env.GOOGLE_API_KEY});
		}
	});
});

//EDIT - edit a hotel
router.get("/hotels/:id/edit", middleware.checkHotelOwnership, function(req, res){
	Hotel.findById(req.params.id, function(err, foundHotel){
		if(err){
			res.redirect("/hotels");
		} else{
			res.render("hotels/edit.ejs", {hotel: foundHotel});
		}
	});
});

//UPDATE - update a hotel
router.put("/hotels/:id", middleware.checkHotelOwnership, function(req, res){
	Hotel.findByIdAndUpdate(req.params.id, req.body.hotel, function(err, updatedHotel){
		if(err){
			res.redirect("/hotels");
		} else{
			res.redirect("/hotels/" + req.params.id);
		}
	});
});

//DESTROY - delete a hotel
router.delete("/hotels/:id", middleware.checkHotelOwnership, function(req, res){
	Hotel.findByIdAndDelete(req.params.id, function(err){
		if(err)
			res.redirect("/hotels");
		else
			res.redirect("/hotels");
	});
});

module.exports = router;
