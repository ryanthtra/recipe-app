// 'use strict';
const mongoose = require('mongoose'),
{Schema} = require('mongoose'),
Subscriber = require('./subscriber'),
bcrypt = require('bcrypt');
const passportLocalMongoose = require('passport-local-mongoose');


var userSchema = new Schema({
  name: {
    first: {
      type: String,
      trim: true
    },
    last: {
      type: String,
      trim: true
    }
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: [true, 'A user with this email already exists!']
  },
  zipCode:  {
    type: Number,
    min: [1000, 'Zip code too short'],
    max: 99999
  },
  // password: {
  //   type: String, required: true
  // },
  // (Password now provided automatically by Passport in forms of fields 'hash' and 'salt'.)
  subscribedAccount: {type: Schema.Types.ObjectId, ref: 'Subscriber'},
  courses: [{type: Schema.Types.ObjectId, ref: 'Course'}],
},
{
  timestamps: true
});

userSchema.virtual('fullName').get(function(){
  return `${this.name.first} ${this.name.last}`;
});

userSchema.pre('save', function (next) {
  var user = this;
  // bcrypt.hash(user.password, 10)
  // .then(hash =>
  // {
  //   user.password = hash;
  //   next();
  // })
  // .catch(e => 
  // {
  //   next(e);
  //   console.log(`Error in encrypting password: ${e.message}`);
  // });

  // bcrypt.hash(user.email, 10)
  // .then(hash =>
  // {
  //   user.email = hash;
  //   next();
  // })
  // .catch(error =>
  // {
  //   next(error);
  //   console.log(`Error in encrypting email: ${e.message}`);
  // });

  if (user.subscribedAccount === undefined || user.subscribedAccount === null) {
    Subscriber.findOne({email: user.email})
    .then(subscriber => {
      user.subscribedAccount = subscriber;
      next();
    })
    .catch(e => {
      console.log(`Error in connecting subscriber: ${e.message}`);
      next(e);
    });
  } else {
    next();
  }

});

userSchema.methods.passwordComparison = function(inputPassword)
{
  var user = this;
  var result = bcrypt.compare(inputPassword, user.password);
  return result;
};

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'email'
});

module.exports = mongoose.model('User', userSchema, 'User');
