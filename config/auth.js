// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

	'facebookAuth' : {
		'clientID' 		: '260747077418568', // your App ID
		'clientSecret' 	: 'd68331691e468fa43df4a7797253cd56', // your App Secret
		'callbackURL' 	: 'http://localhost:7070/auth/facebook/callback'
	}

};