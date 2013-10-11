'use strict';

var async       = require('async');
var node_util   = require('util');
var util        = require('./lib/util');
var parser      = require('./lib/schema');

var checker = module.exports = function(schema, options) {
    return new Checker(schema, options); 
};

checker.Checker = Checker;
checker.parseSchema = parser.parseSchema;
checker.util = util;


// @param {Object} options
// - context: {Object} the context of the helper functions
// - default_message: {string}
// - parallel: {boolean=false} whether checker should check the properties in parallel, default to false
// - limit: {boolean=false} limit to the schema
// - check_all: {boolean=false} by default, checker will exit immediately when the first error is encountered.
function Checker(schema, options){
    this.options = options || {};

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
    if ( this.options.limit ) {
        object = this._limitObject(object);
    }

    this._createTasks(object, function (err, details) {
        util.map(details, function (detail, name) {
            detail.value = object[name];
        });

        callback(err, object, details);
    });
};


// Private methods
//////////////////////////////////////////////////////////////////////


Checker.prototype._createTasks = function(object, callback) {
    var tasks = {};
    var name;
    var self = this;
    var schema = this._schema;

    util.map(schema, function (rule, name) {

        // The value of the  `object` might be changed or ruined during the process,
        // so store important data
        var is_default = !(name in object);

        // the origin value
        var origin = object[name];
        var value = is_default ? rule.default : object[name];

        // set the new value
        object[name] = value;

        tasks[name] = function(done){
            new checker._Single({
                object: object,
                name: name,
                is_default: is_default,
                rule: rule,
                default_message: self.options.default_message,
                done: function(err, new_value){
                    done(err, {
                        // the origin value
                        origin: origin,

                        // if is_default is `true`, means the value is not specified
                        is_default: is_default,

                        // whether the value is parsed by the setters
                        is_cooked: !!rule.setter.length,

                        // the new value
                        value: new_value,

                        // store the error in `details`
                        error: err
                    });
                },
                context: self.options.context
            });
        };
    });

    var method = this.options.parallel ? 'parallel' : 'series';
    var mod = this.options.check_all ? util : async;

    mod[method](tasks, callback);
};


// All properties of the object should be within the schema
Checker.prototype._limitObject = function(object) {
    var parsed = {};
    var name;

    for (name in this._schema) {
        if ( name in object ) {
            parsed[name] = object[name];
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
            // make sure, the argument types are always the same
            return done(err, self._get_value());
        }

        self._set(done);
    });
};


Single.prototype._get_value = function() {
    return this.object[this.name];
};

Single.prototype._set_value = function(value) {
    this.object[this.name] = value;
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
                self._runAsync(
                    validator, 
                    [
                        // the value might be changed during the validation by `this.set()`
                        self._get_value(), 
                        self.is_default
                    ], function(err){
                        done(self._generateError(err, index));
                    }, 
                    false
                );
            };
        }),

        callback
    );
};


Single.prototype._generateError = function(err, index) {
    if ( err === true ) {
        var message = this.rule.message || this.default_message;
        err = (
            // There's a error message for each validator
            node_util.isArray(message) ?
                message[index] || message[0]:
                message
        ) || true
    }

    return err;
};


Single.prototype._set = function(callback) {
    var setters = this.rule.setter;
    var self = this;

    if(setters.length === 0){
        // the status of `is_default` is not changed
        return callback(null, this._get_value());
    }

    async.waterfall(
        setters.map(function (setter, index) {
            return function(v, done){
                // the first function of `async.waterfall` series
                if(arguments.length === 1){
                    done = v;
                    v = self._get_value();
                }

                self._runAsync(setter, [v, self.is_default], function(err, new_value){
                    // so the new value could be accessed by `this.get()`
                    self._set_value(new_value);
                    done(self._generateError(err, index), new_value);

                }, true);
            }
        }),
        
        // user may pass unexpected parameters to `done`
        function(err, value){
            callback(err, value);
        }
    );
};

