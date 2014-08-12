'use strict';

var parser = exports;
var node_util = require('util');
var makeArray = require('make-array');


parser.parse = function(rule) {
  var parsed = {};
  // undefined -> []
  parsed.validate = parser._parse_validators(rule.validate);
  parsed.set = parser._parse_funcs(rule.set);
  parsed.get = parser._parse_funcs(rule.get);

  return parsed;
};


// See "schema design"
parser._parse_validators = function(validators) {
  return makeArray(validators).map(function(validator) {
    return parser._parse_validator(validator);

  }).filter(Boolean);
};


parser._parse_validator = function(validator) {
  if (typeof validator === 'function') {
    return validator;

  } else if (node_util.isRegExp(validator)) {
    return function(v) {
      return validator.test(v);
    };

  } else {
    return false;
  }
};


parser._parse_funcs = function(funcs) {
  return makeArray(funcs).filter(function(func) {
    return typeof func === 'function';
  });
};
