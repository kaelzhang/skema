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
// - parallel: {boolean=false} whether checker should check the properties in parallel, default to false
// - limit: {boolean=false} limit to the schema
function Checker(schema, options){
    this.options = options = options || {};

    this._types = {};
    this._schema = checker.parseSchema(schema);
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
    
    async[this.options.parallel ? 'parallel' : 'series'](
        names.map(function (name) {
            return function (done) {
                var rule = self._schema[name];
                var is_default = !(name in object);

                var value = is_default ? rule.default : object[name];

                new checker._Single({
                    object: object,
                    value: value,
                    is_default: is_default,
                    rule: rule,
                    done: done,
                    context: self.options.context
                });
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


function Single (options) {
    util.mix(this, options);

    this._process();
}

// for testing
checker._Single = Single;

Single.prototype._process = function() {
    var self = this;
    var done = this.done;

    this._validate(function (err) {
        if ( err ) {
            return done(err);
        }

        self._set(done);
    });
};


Single.prototype._changeObj = function (name, value) {
    this.object[name] = value;
};


Single.prototype._getValue = function(name) {
    return this.object[name];
};


// @param {function(args)} validator
// @param {Array} args
// @param {function()} callback    
Single.prototype._runAsync = function (fn, args, callback, is_setter) {
    var async;
    var self = this;
    var context = {
        context: this.context,
        async: function() {
            async = true;
            return util.once(callback);
        },

        get: function(name){
            return self._getValue(name);
        },

        set: function(name, value){
            self._changeObj(name, value);
        }
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


Single.prototype._validate = function(callback) {
    var validators = this.rule.validator;
    var self = this;

    if(validators.length === 0){
        return callback(null);
    }

    async.series(
        validators.map(function (validator, index) {
            return function (done) {
                self._runAsync(validator, [self.value, self.is_default], function(err){
                    done(self._generateError(err, index));
                }, false);
            };
        }),

        callback
    );
};


Single.prototype._generateError = function(err, index) {
    if ( err === true ) {
        var message = this.rule.message;
        err = (
            node_util.isArray(message) ?
                message[index] || message[0]:
                message
        ) || true
    }

    return err;
};


Single.prototype._set = function(callback) {
    var setters = this.rule.setter;
    var value = this.value;
    var self = this;

    if(setters.length === 0){
        // the status of `is_default` is not changed
        return callback(null, value, false);
    }

    async.waterfall(
        setters.map(function (setter, index) {
            return function(v, done){
                // the first function of `async.waterfall` series
                if(arguments.length === 1){
                    done = v;
                    v = value;
                }

                self._runAsync(setter, [value, self.is_default], function(err, value){
                    done(self._generateError(err, index), value);

                }, true);
            }
        }),
        
        // user may pass unexpected parameters to `done`
        function(err, value){
            callback(err, value, true);
        }
    );
};

