'use strict'

var async = require('async')
var wrap = require('wrap-as-async')
var util = require('util')

var parser = require('./lib/parser')
var types = require('./lib/types')


module.exports = skema
skema.Skema = Skema
skema.types = types

function skema (rule, options) {
  return new Skema(rule, options || {})
}


function Skema (rule, options) {
  var type = rule.type
  type = Object(type) === type
    ? type
    : {}

  // No arguments overloading, you should make sure the `options` is ok
  this.rule = {
    set     : merge_rule(type.set, rule.set, parser.parse_funcs),
    get     : merge_rule(type.get, rule.get, parser.parse_funcs),
    validate: merge_rule(type.validate, rule.validate, parser.parse_validators)
  }

  this.options = options
  this._context = {}
}


function merge_rule (a, b, fn) {
  return fn(a).concat(fn(b))
}


function overload (fn, n) {
  return function (value, args, callback) {
    if (!util.isArray(args)) {
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
  return this.options.sync_setter
    ? this._run_sync('set', value, args)
    : this._run_async('set', value, args, callback)
})


Skema.prototype.get = overload(function(value, args, callback) {
  return this.options.sync_getter
    ? this._run_sync('get', value, args)
    : this._run_async('get', value, args, callback)
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
