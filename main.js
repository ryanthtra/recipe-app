'use strict';

const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
//router = express.Router(),
const passport = require('passport');

const homeController = require('./controllers/homeController');
const errorController = require('./controllers/errorController');
const subscribersController = require('./controllers/subscribersController');
const coursesController = require('./controllers/coursesController');
const usersController = require('./controllers/usersController');

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const connectFlash = require('connect-flash');
const expressValidator = require('express-validator');

app.use(passport.initialize());
app.use(passport.session());

const User = require('./models/user');
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(cookieParser('secret_passcode')); // 'secret_passcode' IS the passcode
app.use(expressSession({
  secret: 'secret_passcode',
  cookie: {
    maxAge: 4000000
  },
  resave: false,
  saveUninitialized: false
}));
app.use(connectFlash());

app.use((req, res, next) =>
{
  res.locals.flashMessages = req.flash();
  res.locals.loggedIn = req.isAuthenticated();
  res.locals.currentUser = req.user;
  console.log(`IS LOGGED IN? -- ${req.isAuthenticated()}`);
  next();
});

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost/recipe_db');
var db = mongoose.connection;

db.once('open', () => { console.log("Successfully connected with Mongoose!")});

app.set('port', process.env.PORT || 3000);

app.set('view engine', 'ejs');
app.use(layouts);

app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));

app.use(express.static(`${__dirname}/public`));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Place this after bodyParser middleware.
app.use(expressValidator());

app.get('/', homeController.index);
app.get('/users', usersController.addSlash, usersController.index, usersController.indexView);
app.get('/users/new', usersController.new );
app.post('/users/create', usersController.validate, usersController.create, usersController.redirectView );
app.get('/users/login', usersController.login);
app.post('/users/login', usersController.authenticate);
app.get('/users/:id/edit', usersController.edit );
app.put('/users/:id/update', usersController.update, usersController.redirectView );
app.get('/users/:id', usersController.show, usersController.showView );
app.delete('/users/:id/delete', usersController.delete, usersController.redirectView  );


app.get('/subscribers', subscribersController.index, subscribersController.indexView);
app.get('/subscribers/new', subscribersController.new );
app.post('/subscribers/create', subscribersController.create, subscribersController.redirectView );
app.get('/subscribers/:id/edit', subscribersController.edit );
app.put('/subscribers/:id/update', subscribersController.update, subscribersController.redirectView );
app.get('/subscribers/:id', subscribersController.show, subscribersController.showView );
app.delete('/subscribers/:id/delete', subscribersController.delete, subscribersController.redirectView  );


app.get('/subscribe',  subscribersController.new);

app.get('/courses', coursesController.index, coursesController.indexView);
app.get('/courses/new', coursesController.new );
app.post('/courses/create', coursesController.create, coursesController.redirectView );
app.get('/courses/:id/edit', coursesController.edit );
app.put('/courses/:id/update', coursesController.update, coursesController.redirectView );
app.get('/courses/:id', coursesController.show, coursesController.showView );
app.delete('/courses/:id/delete', coursesController.delete, coursesController.redirectView  );




app.get('/courses', homeController.showCourses );
app.get('/contact', homeController.showSignUp );
app.post('/sign-up',homeController.postedSignUpForm );
app.post('/contact', homeController.postedContactForm);

// Error middleware
app.use(errorController.pageNotFoundError);
app.use(errorController.internalServerError);

// app.use("/",router);


app.listen(app.get('port'), () => {
  console.log("Server running at http://localhost:3000");
});
