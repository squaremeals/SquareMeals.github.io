var express = require('express'),
	credentials = require('./credentials'),
	sessionMongoose = require('session-mongoose'),
	connect = require('connect'),
	mongoose = require('mongoose');

const app = express();
app.set('port', process.env.PORT || 3000);

const handlebars = require('express-handlebars').create({
	defaultLayout: 'main',
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


// Static resources will automatically look in the './public' directory
app.use(express.static(__dirname + '/public'));

// Used for parsing forms
app.use(require('body-parser').urlencoded({ extended: true}));

// Mongo Setup
const opts = {
	server: {
		socketOptions: { keepAlive: 1 }
	}
};
mongoose.connect(credentials.mongo.development.connectionString, opts);

var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({
	url: credentials.mongo.development.connectionString
});

var EmailSignup = require('./models/EmailSignup.js');

// Used for sessions
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
	resave: false,
	saveUninitialized: false,
	secret: credentials.cookieSecret,
	store: sessionStore,
}));

// This middleware is needed for forms
app.use(require('body-parser').urlencoded({ extended: true}));

app.use(function(req, res, next) {
	// if there's a flash message, transfer
	// it to the context, then clear it
	res.locals.flash = req.session.flash;
	delete req.session.flash;
	next();
});

app.get('/', function(req, res) {
	return res.render('home');
});

app.post('/', function(req, res) {

	const emailAddress = req.body.emailAddress;

	if (!emailAddress) {
		return res.redirect(303, '/');
	}

	const emailSignup = new EmailSignup({
		emailAddress: emailAddress,
	})

	emailSignup.save(function(error, emailSignup) {

		if (error || !emailSignup) {
			console.log(error);
			return res.redirect(303, '/');
		}

		console.log(`Email Address ${emailAddress} signed up.`);
		return res.redirect(303, '/thank-you');
	});

});

app.get('/thank-you', function(req, res) {
	return res.render('thank-you');
});


// custom 404 page
app.use(function(req, res) {
    res.status(404);
    res.render('404');
});


// custom 500 page
app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.type('text/plain');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function() {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
