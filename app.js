var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var Hotel = require('./models/hotel.js');
var Comment = require('./models/comment.js');
var User = require("./models/user.js");
var Booking = require("./models/booking.js");
var middleware = require('./middleware')
var paypal = require('paypal-rest-sdk');
var keys = require('./config/keys.js')

//requiring routes
var hotelRoutes = require('./routes/hotels');
var commentRoutes = require('./routes/comments');
var indexRoutes = require('./routes/index')

//paypal configure
paypal.configure({
	'mode': 'sandbox', //sandbox or live
	'client_id': keys.paypal.client_id,
	'client_secret': keys.paypal.client_secret
});

mongoose.connect(keys.mongodb.uri, { useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();
app.set('view engine', 'ejs');

//PASSPORT CONFIGURATION
app.use(require("express-session")({
	secret: "text",
	resave: false,
	uninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){               //This will add middleware to all the routes
	res.locals.currentUser = req.user;          //This will pass the User object to currentUser. Whatever
                                                //we put in res.locals is available in our templates
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
 	next();                                     //This will call the next middleware
});	                                            

app.use(indexRoutes);
app.use(hotelRoutes);
app.use(commentRoutes);

//Book a hotel
app.get("/hotels/:id/book", middleware.isLoggedIn, function(req,res){
	Hotel.findById(req.params.id, function(err, foundHotel){
		if(err){
			res.redirect("/hotels");
		} else {
			res.render("hotels/book.ejs", {hotel: foundHotel});
		}
	});
});

//bookings route
app.get("/bookings", middleware.isLoggedIn, (req,res) => {
	User.findById(req.user._id).populate("bookings").exec(function(err, foundUser){
		if(err){
			console.log(err);
		} else {
			res.render("bookings.ejs", {user: foundUser});
		}
	});
});

app.post('/pay', (req,res) => {
	const customer = req.body.customer;
	const date = req.body.date;
	const roomType = req.body.roomType;
	const price = req.body.price;

	var create_payment_json = {
		"intent": "sale",
		"payer": {
			"payment_method": "paypal"
		},
		"redirect_urls": {
			"return_url": "https://hotelbooking17.herokuapp.com/success",
			"cancel_url": "https://hotelbooking17.herokuapp.com/cancel"
		},
		"transactions": [{
			"item_list": {
				"items": [{
					"name": roomType,
					"sku": customer,
					"price": price,
					"currency": "INR",
					"quantity": "1"
				}]
			},
			"amount": {
				"currency": "INR",
				"total": price
			},
			"description": date.toString()
		}]
	};

	paypal.payment.create(create_payment_json, function(error, payment) {
		if (error) {
			throw error;
		} else {
			for(let i=0; i<payment.links.length; i++){
				if(payment.links[i].rel === 'approval_url')
					res.redirect(payment.links[i].href);
			}
		}
	});
});

app.get("/success", (req, res) => {
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;

	const execute_payment_json = {
		"payer_id": payerId
	};
	
	paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
		if (error) {
			console.log(error.response);
			throw error;
		} else {
			// console.log("Get Payment Response");
			//console.log(JSON.stringify(payment));

			var name = payment.transactions[0].item_list.items[0].sku;
			var roomType = payment.transactions[0].item_list.items[0].name;
			var date = payment.transactions[0].description;
			var amount = payment.transactions[0].amount.total;
			var newBooking = {name: name, roomType: roomType, date: date, amount: amount};
			Booking.create(newBooking, function(err, newlyCreted){
				if(err){
					console.log(err);
				} else {
					User.findById(req.user._id, function(err, foundUser){
						if(err){
							console.log(err);
						} else {
							foundUser.bookings.push(newlyCreted);
							foundUser.save();
						}
					});

					User.findOne({type: "admin"}, function(err, foundUser){
						if(err){
							console.log(err);
						} else {
							foundUser.bookings.push(newlyCreted);
							foundUser.save();
							res.redirect("/hotels");
						}
					});
				}
			});
		}
	});
});

app.get("/cancel", (req, res) => {
	res.send('Cancelled');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));