// app/models/page.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our page model
var pageSchema = mongoose.Schema({
    pageid: { type: String, index: true, unique: true},
    userid: String,
    name: String,
    access_token: String,
    last_access: {type: Date, default: Date.now} //save the date of retrieving this data, makes future Rest Calls to FB easier
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Page', pageSchema);