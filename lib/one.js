'use strict';

module.exports = One;

var parser = require('./parser');
var util = require('./util');
var mix = require('mix2');
var async = require('async');

// ## options.rule
// {
//   validate: function (value) {
//     var done = this.async();
//     done(err, value);
//   },
//   set: function (value) {},
//   get: function (value) {}
// }

function One (options) {
  // No arguments overloading, you should make sure the `options` is ok
  this.rule = parser.parse(options.rule);
  this.context = options.context;
  delete this.context.async;
}


One.prototype.validate = function(value, callback) {
  var self = this;
  async.eachSeries(this.rule.validate, function (fn, done) {
    self._run_async(fn, [value], done);

  }, function (err) {
    // `err` might be undefined in async
    callback(err || null);
  });
};


One.prototype.set = function(value, callback) {
  this._run_type('set', value, callback);
};


One.prototype.get = function(value, callback) {
  this._run_type('get', value, callback);
};


One.prototype._run_type = function(type, value, fallback) {
  var self = this;
  async.eachSeries(this.rule[type], function (fn, done) {
    self._run_async(fn, [value], function (err, v) {
      if (err) {
        return done(err);
      }
      value = v;
      done(null);
    }, true);
  
  }, function (err) {
    if (err) {
      return fallback(err);
    }
    fallback(null, value);
  });
};


One.prototype._run_async = function(fn, args, callback, is_setter) {
  var is_async;
  var context = {
    async: function() {
      is_async = true;
      return util.once(callback);
    }
  };

  mix(context, this.context);
  var result = fn.apply(context, args);

  if (is_async) {
    return;
  }

  if (is_setter) {
    callback(null, result);

  } else {
    if (typeof result === 'string' || result instanceof Error) {
      return callback(result);
    }

    // `result` tells whether the value is valid
    // if `result` == true, err -> null
    callback(!result || null);
  }
};
