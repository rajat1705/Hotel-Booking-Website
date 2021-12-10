var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get("/", function(req, res){
	res.render("landing.ejs");
});


//==============
// AUTH ROUTES
//==============

//show sign up form
router.get("/register", function(req, res){
	res.render("register.ejs");
});

//handle sign up logic
router.post("/register", function(req, res){
	User.register(new User({username: req.body.username, type: "customer"}), req.body.password, function(err, user){
		if(err){
			req.flash("error", err.message);
			return res.render("register.ejs");
		}
		passport.authenticate("local")(req, res, function(){
			req.flash("success", "Welcome " + user.username);
			res.redirect("/hotels");
		});
	});
});

//show login form
router.get("/login", function(req, res){
	res.render("login.ejs");
});

//handling login logic
router.post("/login", passport.authenticate("local",
	{
		successRedirect: "/hotels",
		failureRedirect: "/login"
	}), function(req, res){
	
});

//logout route
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!");
	res.redirect("/hotels");
});

// Auth with google
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email']}));

// Google auth callback
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login'}), function(req, res) {
	res.redirect('/hotels');
})

module.exports = router;
