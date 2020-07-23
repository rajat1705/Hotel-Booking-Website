var express = require('express');
var router = express.Router();
var Hotel = require('../models/hotel');
var Comment = require('../models/comment');
var middleware = require('../middleware');

//==================
// COMMENT ROUTES
//==================

router.get("/hotels/:id/comments/new", middleware.isLoggedIn, function(req,res){
	Hotel.findById(req.params.id, function(err, hotel){
		if(err)
			console.log(err);
		else
			res.render("comments/new.ejs", {hotel: hotel});
	});
});

router.post("/hotels/:id/comments", middleware.isLoggedIn, function(req,res){
	Hotel.findById(req.params.id, function(err, hotel){
		if(err)
			console.log(err);
		else {
			Comment.create(req.body.comment, function(err, newComment){
				if(err)
					console.log(err);
				else{
					//add username and id to comment
					newComment.author.id = req.user._id;
					newComment.author.username = req.user.username;
					//save comment
					newComment.save();
					hotel.comments.push(newComment);
					hotel.save();
					res.redirect("/hotels/" + req.params.id);
				}
			});
		}
	});
});

//EDIT comment
router.get("/hotels/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
	Comment.findById(req.params.comment_id, function(err, foundComment){
		if(err){
			res.redirect("back");
		} else{
			res.render("comments/edit.ejs", {comment: foundComment, hotel_id: req.params.id});
		}
	});
}); 

//UPDATE comment
router.put("/hotels/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, foundComment){
		if(err){
			res.redirect("back");
		} else{
			res.redirect("/hotels/" + req.params.id);
		}
	});
});

//DELETE comment
router.delete("/hotels/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
	Comment.findByIdAndDelete(req.params.comment_id, function(err){
		if(err){
			res.redirect("back");
		} else{
			req.flash("success", "Comment Deleted")
			res.redirect("/hotels/" + req.params.id);
		}
	});
});

module.exports = router;