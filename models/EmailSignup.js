var mongoose = require('mongoose');

var schema = mongoose.Schema({
	emailAddress: String,
});

var EmailSignup = mongoose.model('EmailSignup', schema);
module.exports = EmailSignup;