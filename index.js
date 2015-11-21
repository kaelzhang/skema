'use strict';


var parser = require('./lib/parser');
var util = require('./lib/util');
var mix = require('mix2');
var async = require('async');
var wrap = require('wrap-as-async');


module.exports = skema;
skema.Skema = Skema;
skema.parse = parser.parse;


function skema (rule) {
  return new Skema(rule || {});
}


// ## options.rule
// {
//   validate: function (value) {
//     var done = this.async();
//     done(err, value);
//   },
//   set: function (value) {},
//   get: function (value) {}
// }

function Skema (rule) {
  // No arguments overloading, you should make sure the `options` is ok
  this.rule = parser.parse(rule);
  this.context = {};
  delete this.context.async;
}


function overload (fn) {
  return function (value, args, callback) {
    if (arguments.length === 2) {
      callback = args;
      args = [];
    }

    return fn.call(this, value, args, callback);
  };
}


Skema.prototype.context = function(context) {
  if (Object(context) === context) {
    this.context = context;
  }

  return this;
};


Skema.prototype.validate = overload(function(value, args, callback) {
  var self = this;

  // Pass in the same parameters for validators
  value = [value].concat(args);
  async.eachSeries(this.rule.validate, function (fn, done) {
    self._run_async(fn, value, done);

  }, function (err) {
    // `err` might be undefined in async
    // make sure if there is no error, the error is always `null`
    callback(err || null);
  });
});


Skema.prototype.set = overload(function(value, args, callback) {
  this._run_type('set', value, args, callback);
});


Skema.prototype.get = overload(function(value, args, callback) {
  this._run_type('get', value, args, callback);
});


Skema.prototype._run_type = function(type, value, args, fallback) {
  var self = this;
  async.eachSeries(this.rule[type], function (fn, done) {
    // Pass the last modified value to the next
    self._run_async(fn, [value].concat(args), function (err, v) {
      if (err) {
        return done(err);
      }

      value = v;
      done(null);
    });

  }, function (err) {
    if (err) {
      return fallback(err);
    }

    fallback(null, value);
  });
};


Skema.prototype._run_async = function(fn, args, callback) {
  args.push(callback);
  wrap(fn).apply(context, args);
};
