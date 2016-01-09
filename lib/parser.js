'use strict'

var parser = exports
var node_util = require('util')
var make_array = require('make-array')


// See "schema design"
parser.parse_validators = function(validators) {
  return make_array(validators).map(function(validator) {
    return parser._parse_validator(validator)

  }).filter(Boolean)
}


parser._parse_validator = function(validator) {
  if (node_util.isFunction(validator)) {
    return validator
  }

  if (node_util.isRegExp(validator)) {
    return function(v) {
      return validator.test(v)
    }
  }

  return false
}


parser.parse_funcs = function(funcs) {
  return make_array(funcs).filter(node_util.isFunction)
}
