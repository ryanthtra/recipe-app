// 'use strict';

const User = require('../models/user');
const passport = require('passport');

module.exports = {
  addSlash: (req, res, next) =>
  {
    if (!req.path.endsWith('/')) {
      res.redirect(`${req.path}/`);
    }
    else {
      next();
    }
  },

  index: (req, res, next) => {
    User.find({})
    .then(users => {
      res.locals.users = users;
      next();
    })
    .catch( error =>{
      console.log(`Error fetching users: ${error.message}`);
      req.flash('error', `Error fetching users: ${error.message}`);
      next(error);
    });
  },
  indexView: (req, res) => {
    res.render('users/index', {
      users: res.locals.users,
      flashMessages: {
        success: 'Loaded all users!'
      }
    });
  },

  new: (req, res) => {
    res.render('users/new');
  },

  create: (req, res) =>
  {
    // Passport.js implementation
    var u = new User(getUserParams(req.body));
    User.register(u, req.body.password, function(e, user)
    {
      if (user) {
        req.flash('success', `${user.fullName}'s account created successfully!`);
        res.redirect('/users');
      } 
      else {
        req.flash('error', `Failed to crate user account because: ${e.message}.`);
        res.redirect('users/news');
      }
    });
    // var userParams = getUserParams(req.body);
    // User.create(userParams)
    // .then(user =>
    // {
    //   req.flash('success', `${user.fullName}'s account created successfully!`);
    //   res.redirect('/users');
    // })
    // .catch(error =>
    // {
    //   req.flash('error', `Failed to create user account because: ${error.message}.`);
    //   console.log(`Error fetching users: ${error.message}`);
    //   res.redirect('/');
    // });
  },

  redirectView: (req, res, next) => {
    var redirectPath = res.locals.redirect;
    if (redirectPath !== undefined) res.redirect(redirectPath);
    else next();
  },

  show: (req, res, next) => {
    var userId = req.params.id;
    User.findById(userId)
    .then(user => {
      res.locals.user = user;
      next();
    })
    .catch(error => {
      console.log(`Error fetching user by ID: ${error.message}`)
      req.flash('error', `Error fetching user by ID: ${error.message}`);
      next(error);
    });
  },

  showView: (req, res) => {
    res.render('users/show');
  },

  edit: (req, res, next) => {
    var userId = req.params.id;
    User.findById(userId)
    .then(user => {
      res.render('users/edit', {user: user});
    })
    .catch(error => {
      console.log(`Error fetching user by ID: ${error.message}`);
      req.flash('error', `Error fetching user by ID: ${error.message}`);
      next(error);
    });
  },

  update: (req, res, next) => {
    var userId = req.params.id,
    userParams = {name: {first: req.body.first, last: req.body.last}, email: req.body.email, password: req.body.password, zipCode: req.body.zipCode};

    User.findByIdAndUpdate(userId, { $set: userParams })
    .then(user => {
      res.locals.redirect = `/users/${userId}`;
      req.flash('success', `${user.fullName}'s account updated successfully!`);
      res.locals.user = user;
      next();
    })
    .catch(error => {
      console.log(`Error updating user by ID: ${error.message}`);
      req.flash('error', `Failed to update user account because: ${error.message}.`);
      res.locals.redirect = `/users/${userId}/edit`;
      next();
    });
  },

  delete: (req, res, next) => {
    var userId = req.params.id;
    User.findByIdAndRemove(userId)
    .then(user => {
      res.locals.redirect = '/users';
      req.flash('success', `${user.fullName}'s account deleted successfully!`);
      next();
    })
    .catch(error => {
      console.log(`Error deleting user by ID: ${error.message}`);
      req.flash('error', `Error deleting user by ID: ${error.message}`);
      next();
    });
  },

  login: (req, res) =>
  {
    res.render('users/login', {
      title: "Login"
    });
  },

  // Passport.js implementation
  authenticate: passport.authenticate('local',
  {
    failureRedirect: '/users/login',
    failureFlash: "Failed to login",
    successRedirect: '/',
    successFlash: "Logged in!"
  }),
  // authenticate: (req, res) =>
  // {
    // User.findOne({email: req.body.email})
    // .then(user =>
    // {
    //   if (user) {
    //     res.locals.user = user;
    //     return user.passwordComparison(req.body.password);
    //   }
    //   else {
    //     req.flash('error', `Error: cannot find user with the email ${req.body.email}!`);
    //     next();
    //   }
    // })
    // .then(passwordsMatch =>
    // {
    //   if (passwordsMatch) {
    //     req.flash('erro')
    //     res.redirect(`/users/${res.locals.user._id}`);
    //   }
    //   else {
    //     throw new Error('Passwords do not match');
    //   }
    // })
    // .catch(e =>
    // {
    //   console.log(`Error logging in user: ${e.message}`);
    //   res.redirect('/users/login');
    // });
  // },

  validate: (req, res, next) =>
  {
    req.sanitizeBody('email')
    .normalizeEmail({
      all_lowercase: true
    });

    req.check('email', 'Email is invalid')
    .isEmail();

    req.check('zipCode', 'Zip code is invalid')
    .notEmpty()
    .isInt()
    .isLength({
      min: 5,
      max: 5
    })
    .equals(req.body.zipCode);

    req.check('password', 'Password cannot be empty')
    .notEmpty();

    req.getValidationResult()
    .then((errors) =>
    {
      if (!errors.isEmpty()) {
        var messages = errors.array().map(error => error.msg);
        req.skip = true;
        req.flash('error', messages.join(' and '));
        res.render('users/new', {
          flashMessages: req.flash(),
          locals: getUserParams(req.body)
        });
        return;
      }
      else {
        next();
      }
    });
  }

};

var getUserParams = function(body)
{
  return {
    name: {
      first: body.first,
      last: body.last,
    },
    email: body.email,
    password: body.password,
    zipCode: body.zipCode
  };
};
