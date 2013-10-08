'use strict';

var async       = require('async');
var node_util   = require('util');
var util        = require('./lib/util');
var parser      = require('./lib/schema');

var checker = module.exports = function(options) {
    return new Checker(options); 
};

checker.Checker = Checker;
checker.parseSchema = parser.parseSchema;


// @param {Object} options
// - context: {Object} the context of the helper functions
// - default_message: {string}
// - series: {boolean=false} whether checker should check the properties in series, default to false
// - limit: {boolean=false} limit to the schema
function Checker(schema, options){
    this.options = options = options || {};

    this._types = {};
    this._schema = checker.parseSchema(schema);

    // context must be an object
    this._context = Object(options.context) === options.context ?
        options.context :
        {};
};


// ## Design
// checker.check({}, function (err, value, detail) {
// });

// detail -> {
//     <property>: {
//         is_default:
//         value: 
//     }
// }

Checker.prototype.check = function(object, callback) {
    var names = Object.keys(this._schema);
    var self = this;

    if ( this.options.limit ) {
        object = this._limitObject(object);
    }
    
    async[this.options.series ? 'series' : 'parallel'](
        names.map(function (name) {
            return function (done) {
                var rule = self._schema[name];
                var is_default = !(name in object);

                var value = is_default ? rule.default : object[name];

                self._process(value, is_default, rule, done);
            };
        }),

        function (err, results) {
            if ( err ) {
                return callback(err);
            }

            var parsed = {};
            var detail = {};

            names.forEach(function (name, index) {
                var result = results[index];
                var value = result[0];

                parsed[name] = value;
                detail[name] = {
                    // the origin value
                    origin: object[name],

                    // if is_default is `true`, means the value is not specified
                    is_default: !(name in object),

                    // whether the value is parsed by the setters
                    is_cooked: result[1],

                    // the result
                    value: value
                };
            });

            callback(null, parsed, detail);
        }
    )
};


// Private methods
//////////////////////////////////////////////////////////////////////

// All properties of the object should be within the schema
Checker.prototype._limitObject = function(object) {
    var parsed = {};
    var name;

    for (name in this._schema) {
        if ( name in object ) {
            parsed[name] = object;
        }
    }

    return parsed;
};


Checker.prototype._process = function(value, is_default, rule, callback) {
    var self = this;

    this._validate(value, is_default, rule, function (err) {
        if ( err ) {
            if ( err === true ) {
                err = rule.message || this.options.default_message || true;
            }

            return callback(err); 
        }

        self._set(value, is_default, rule, callback);
    });
};


// @param {function(args)} validator
// @param {Array} args
// @param {function()} callback    
Checker.prototype._runAsync = function (fn, args, callback, is_setter) {
    var async;
    var context = this._context;

    context.async = function() {
        async = true;
        return util.once(callback);
    };

    var result = fn.apply(context, args);

    if ( !async ) {
        is_setter ? 
            // `result` is the new value
            callback(null, result) :

            // `result` tells whether the value is valid
            // if `result` == true, err -> null
            callback(!result || null);
    }
};


Checker.prototype._validate = function(value, is_default, rule, callback) {
    var validators = rule.validator;
    var self = this;

    if(validators.length === 0){
        return callback(null);
    }

    async.series(
        validators.map(function (validator) {
            return function (done) {
                self._runAsync(validator, [value, is_default], done, false);
            };
        }),

        callback
    );
};


Checker.prototype._set = function(value, is_default, rule, callback) {
    var setters = rule.setter;
    var self = this;

    if(setters.length === 0){
        // the status of `is_default` is not changed
        return callback(null, value, false);
    }

    async.waterfall(
        setters.map(function (setter) {
            return function(v, done){
                // the first function of `async.waterfall` series
                if(arguments.length === 1){
                    done = v;
                    v = value;
                }

                self._runAsync(setter, [value, is_default], done, true);
            }
        }),
        
        // user may pass unexpected parameters to `done`
        function(err, value){
            callback(err, value, true);
        }
    );
};

