const GoogleStrategy = require('passport-google-oauth20').Strategy
const mongoose = require('mongoose')
const User = require('../models/user.js')
const keys = require('./keys.js')

module.exports = function(passport) {
    passport.use(new GoogleStrategy({
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret,
        callbackURL: '/auth/google/callback'
    }, function(accessToken, refreshToken, profile, done) {
        const newUser = {
            username: profile.emails[0].value,
            type: 'customer'
        }

        User.findOne({ username: profile.emails[0].value }, function(err, user) {
            if(err) {
                condole.log(err);
            } else if(user){
                done(null, user)
            } else {
                User.create(newUser, function(err, user) {
                    if(err) {
                        console.log(err);
                    } else {
                        done(null, user);
                    }
                })
            }
        })
    }))

    passport.serializeUser(function(user, done) {
        done(null, user.id)
    })

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user) {
            done(err, user)
        })
    })
}