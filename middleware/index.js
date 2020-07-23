var Hotel = require('../models/hotel');
var Comment = require('../models/comment');

//all middleware goes here
var middlewareObj = {};

middlewareObj.checkHotelOwnership = function(req, res, next){
	if(req.isAuthenticated() && req.user.type === "admin"){
		Hotel.findById(req.params.id, function(err, foundHotel){
			next();
		});
	} else{
		req.flash("error", "You need to be logged in to that");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash("error", "Comment not found...")
				res.redirect("back");
			} else{
				if(foundComment.author.id.equals(req.user._id)){
					next();
				} else{
					req.flash("error", "You don't have the permission to do that");
					res.redirect("back");
				}
			}
		});
	} else{
		req.flash("error", "You need to be logged in to that");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIn = function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}

module.exports = middlewareObj;