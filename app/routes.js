var facebook = require("./facebook.js");
// load up the user model
var User       		= require('../app/models/user');
var Page       		= require('../app/models/page');
// app/routes.js
module.exports = function(app, passport) {

	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================
	app.get('/', function(req, res) {
		res.render('index.ejs'); // load the index.ejs file
	});

	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	// route for facebook authentication and login
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email', 'manage_pages'] }));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback',
		passport.authenticate('facebook', {
			successRedirect : '/profile',
			failureRedirect : '/'
		}));

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		var userID = req.user.userid;
		var userToken = req.user.token;
		facebook.getFbData(userToken,"/"+userID+"/accounts",function(data){
			var rawData = data;
		    var newData = JSON.parse(rawData); //Parse JSON FB response to JS Object.
		    for (var i = 0; i<newData.data.length; i++) {
		    	var newPage = new Page();
            	newPage.pageid = newData.data[i].id;
            	newPage.userid = userID;
            	newPage.name = newData.data[i].name;
            	newPage.access_token = newData.data[i].access_token;
				Page.update({ pageid: newPage.pageid},{pageid:newPage.pageid, userid: userID,name:newPage.name,access_token: newPage.access_token} ,{upsert:true} , function (err, numberAffected, raw) {
				  if (err) return handleError(err);
				  console.log('The number of updated documents was %d', numberAffected);
				  console.log('The raw response from Mongo was ', raw);
	            });
		    }
		});
		console.log(req.user);
		var uApages = new Array();
		uApages = Page.find({userid: userID}, function(err, pages){
			if(err)
				return err;
			if(pages == 0){
				return null;
			}else{ //There is at least one page
				console.log("pages"+ pages.length);
			    res.render('profile.ejs', { //Redirect after pages are retrieved
					user : req.user, // get the user out of session and pass to template
					userPages: pages
				});
				return false;
			}
		})

	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on 
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/');
}
