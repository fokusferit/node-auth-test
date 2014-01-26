var facebook = require("./facebook.js");
// load up the user model
var User       		= require('../app/models/user');
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
		var checkUser = req.user;
		var fbUserId = checkUser.facebook.id;
		console.log(checkUser + " , " + checkUser.facebook.token)
		facebook.getFbData(checkUser.facebook.token, "/"+fbUserId+'/accounts', function(data){ //get list of user pages
		    var rawData = data;
		    var newData = JSON.parse(rawData); //Parse JSON FB response to JS Object.
		    var pages = new Array();
		    for(var i=0;i<newData.data.length;i++){
		    	pages.push({
		    		'page.id': newData.data[i].id,
		    		'page.name': newData.data[i].name,
		    		'page.pageToken': newData.data[i].access_token
		    	});
		    }
		    User.update({ 'facebook.id' : fbUserId }, {$push: { pages: {$each: pages}}}, function(err,affected) {
			  console.log('affected rows %d', affected);
			  		res.render('profile.ejs', { //Redirect after pages are retrieved
						user : req.user // get the user out of session and pass to template
					});
			});
		});
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
