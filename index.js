'use strict'

var parser = require('./lib/parser')
var async = require('async')
var wrap = require('wrap-as-async')


module.exports = skema
skema.Skema = Skema

function skema (rule, options) {
  return new Skema(rule, options || {})
}


function Skema (rule, options) {
  // No arguments overloading, you should make sure the `options` is ok
  this.rule = {
    set: parser.parse_funcs(rule.set),
    get: parser.parse_funcs(rule.set),
    validate: parser.parse_validators(rule.validate)
  }

  this.options = options
  this._context = {}
}


function overload (fn) {
  return function (value, args, callback) {
    if (arguments.length === 2) {
      callback = args
      args = []
    }

    return fn.call(this, value, args, callback)
  }
}


Skema.prototype.context = function(context) {
  if (Object(context) === context) {
    this._context = context
  }

  return this
}


Skema.prototype.validate = overload(function(value, args, callback) {
  // Pass in the same parameters for validators
  value = [value].concat(args)
  async.eachSeries(this.rule.validate, function (fn, done) {
    function cb (err, pass) {
      if (err) {
        return done(err)
      }

      // if is not an async method,
      // and `parse` is `false`, then error is true
      if (!is_async) {
        return done(!pass)
      }

      done(null)
    }

    var ar = [value].concat(args)
    ar.push(cb)

    var is_async = wrap(fn).apply(this._context, ar)

  }.bind(this), function (err) {

    // `err` might be undefined in async
    // make sure if there is no error, the error is always `null`
    callback(err || null)
  })
})


Skema.prototype.set = overload(function(value, args, callback) {
  return this.options.async_setter
    ? this._run_async('set', value, args, callback)
    : this._run_sync('set', value, args)
})


Skema.prototype.get = overload(function(value, args, callback) {
  return this.options.async_getter
    ? this._run_async('get', value, args, callback)
    : this._run_sync('get', value, args)
})


Skema.prototype._run_sync = function (type, value, args) {
  return this.rule[type].reduce(function (prev, mutator) {
    var ar = [prev].concat(args)
    return mutator.apply(this._context, ar)

  }.bind(this), value)
}


Skema.prototype._run_async = function(type, value, args, fallback) {
  async.eachSeries(this.rule[type], function (mutator, done) {
    function cb (err, v) {
      if (err) {
        return done(err)
      }

      value = v
      done(null)
    }

    var ar = [value].concat(args)
    ar.push(cb)
    wrap(mutator).apply(this._context, ar)

  }.bind(this), function (err) {
    if (err) {
      return fallback(err)
    }

    fallback(null, value)
  })
}
