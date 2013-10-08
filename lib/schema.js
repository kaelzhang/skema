'use strict';

var parser      = module.exports = {};
var util        = require('./util');
var node_util   = require('util');

parser.parseSchema = function(schema) {
    if ( !schema ) {
        return {};
    }

    var parsed = {};
    var name;

    for (name in schema) {
        parsed[name] = parser._parseRule(schema[name]);
    }

    return parsed;
};


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

parser._parseRule = function(rule) {
    // undefined -> []
    rule.validator = parser._parseValidators(rule.validator);
    rule.setter = parser._parseSetters(rule.setter);

    return rule;
};


// See "schema design"
parser._parseValidators = function(validators) {
    return util.makeArray(validators).map(function (validator) {
        return parser._wrapValidator(validator);

    }).filter(Boolean);
};


parser._wrapValidator = function(validator) {
    if(typeof validator === 'function'){
        return validator;
    
    }else if(node_util.isRegExp(validator)){
        return function (v) {
            return validator.test(v);
        };

    }else{
        return false;
    }
};


parser._parseSetters = function(setters) {
    return util.makeArray(setters).filter(function (setter) {
        return typeof setter === 'function';
    });
};