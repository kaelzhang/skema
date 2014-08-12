'use strict';

var parser = exports;
var node_util = require('util');
var makeArray = require('make-array');

// parser.parseSchema = function(schema) {
//   if (!schema) {
//     return {};
//   }

//   var parsed = {};
//   var name;

//   for (name in schema) {
//     parsed[name] = parser._parseRule(schema[name]);
//   }

//   return parsed;
// };


// ## Atom schema design

// ```
// name: {
//     validator: 
//         `Function`: function (v, is_default) {
//             return 
//                 'error message to display' -> override `schema.message`
//         }, -> convert to `Array`

//         `RegExp`: Regular expression that input must be valid against.
//             -> convert to `Array.<Function>`

//         `Array.<Function|RegExp>`

//     message: 'error message to display',
//          -> the default error message

//     default: 'default value'
//          -> if 
// }
// ```

// Sync:

// {
//     setter: function (v, is_default) {
//         // ...
//         return value;
//     }
// }

// Async:

// {
//     setter: function (v, is_default) {
//         var done = this.async();

//         async_method(v, is_default, function(err, value){
//             done(err, value);
//         });
//     }
// }

// An `setter` could be an array.

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
