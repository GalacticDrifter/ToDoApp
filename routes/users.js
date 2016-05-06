var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var express = require('express');
var passport = require('passport');
var jwt = require('express-jwt');
var async = require('async');
var crypto = require('crypto');

var router = express.Router();

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});

var User = mongoose.model('User');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

/* POST for creating a new User */
router.post('/register', function(req, res, next){
    if(!req.body.username || !req.body.email || !req.body.fname || !req.body.lname || !req.body.password || !req.body.password2){
        return res.status(400).json({message: 'Please fill out all the fields'});
    }
    if(req.body.password != req.body.password2){
        return res.status(400).json({message: 'Passwords do not match'});
    } 
    
    var user = new User();
    
    user.username = req.body.username;
    
    user.fname = req.body.fname;

    user.lname = req.body.lname;

    user.setEmail(req.body.email);

    user.setPassword(req.body.password);
    
    user.save(function (err){
        if(err){ return next(err); }
        
        return res.json({token: user.generateJWT()})
    });
});

/* POST for authenticating a User */
router.post('/login', function(req, res, next){
    if(!req.body.username || !req.body.password){
        return res.status(400).json({message: 'Please fill out all the fields'});
    }
    passport.authenticate('local', function(err, user, info){
        if(err){ return next(err); }
        
        if(user){
            return res.json({token: user.generateJWT()});
            return res.redirect('/main/');
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

router.post('/forgot', function(req, res, next) {
    console.log('HTTP route called!!!!!!!!!');
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var emailToken = buf.toString('hex');
                    done(err, emailToken);
                });
            },
            function(emailToken, done) {
                User.findOne({ email: req.body.email }, function(err, user) {
                    if (!user) {
                        return res.status(400).json({message: 'No account with that email address exists.'});
                    }

                    user.resetPasswordToken = emailToken;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, emailToken, user);
                    });
                });
            },
            function(emailToken, user, done) {
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'Gmail',
                    auth: {
                        user: 'vogollc@gmail.com',
                        pass: 'Aeroh5ai'
                    }
                });
                console.log(user.email);
                var mailOptions = {
                    from: 'vogollc@gmail.com',
                    to: user.email,
                    subject: 'Current NodeMailer',
                    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + emailToken + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                
              smtpTransport.sendMail(mailOptions, function(err) {
                return res.status(200).json({message: 'An e-mail has been sent to ' + user.email + ' with instructions on how to reset your password.'});
                done(err, 'done');
              });
          }
      ]);
    });
    
    router.get('/reset/:emailToken', function(req, res) {
        User.findOne({ resetPasswordToken: req.params.emailToken, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            return res.status(400).json({message: 'Password reset token is invalid or has expired.'});
		return res.redirect('/');
        }
		res.sendfile('./public/reset.html');
      });
    });

router.get('/reset', function(req, res) {
		res.sendfile('./public/reset.html');
	});
	
	router.post('/reset/:emailToken', function(req, res) {
  		async.waterfall([
    		function(done) {
      			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        			if (!user) {
          				req.flash('error', 'Password reset token is invalid or has expired.');
          				return res.redirect('back');
        			}

        		user.password = req.body.password;
        		user.resetPasswordToken = undefined;
        		user.resetPasswordExpires = undefined;

        		user.save(function(err) {
          			req.logIn(user, function(err) {
            			done(err, user);
          			});
        		});
      		});
    	},
    function(user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
          user: 'vogollc@gmail.com',
          pass: 'Aeroh5ai'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    	}
  		], function(err) {
    	res.redirect('/');
  		});
	});

module.exports = router;