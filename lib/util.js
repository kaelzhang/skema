'use strict';

var util = module.exports = {};

util.once = function (fn) {
    var ran;

    return function() {
        if (ran) {
            return;
        }
        ran = true;
    
        var ret = fn.apply(this, arguments);
        fn = null;

        return ret;
    };
};


util.mix = function (receiver, supplier, override){
    var key;

    if(arguments.length === 2){
        override = true;
    }

    for(key in supplier){
        if(override || !(key in receiver)){
            receiver[key] = supplier[key]
        }
    }

    return receiver;
};


util.makeArray = function (subject) {
    return Array.isArray(subject) ? 
        subject :
        subject === undefined || subject === null ?
            [] :
            [subject];
};


util.map = function (map, interator, context) {
    var key;

    for (key in map) {
        interator.call(context || null, map[key], key);
    }
};

// `async.parallel` an object task collection, and will not stop when error encounters

// @param {Object} task_map
// @param {function(errs, results)} callback
// - errs: {Object} always be an object,
// - results: {Object}
util.parallel = function (task_map, callback) {
    var counter = Object.keys(task_map).length;
    var results = {};
    var errors = {};
    var first_error = null;

    util.map(task_map, function (task, name) {
        task(function (err) {
            var result = Array.prototype.slice.call(arguments, 1);

            if (result.length <= 1) {
                result = result[0];
            }

            results[name] = result;
            errors[name] = err || null;

            // save the first error
            if ( err && !first_error) {
                first_error = err;
            }

            // run all tasks
            if ( -- counter === 0 ) {
                callback(first_error, results, errors);
            }
        });
    });
};


// Similar to `util.parallel`
util.series = function (task_map, callback) {
    var names = Object.keys(task_map);
    var tasks = names.map(function (name) {
        return task_map[name];
    });

    var length = names.length;
    var results = {};
    var errors = {};
    var first_error = null;
    var current = -1;

    function next () {
        ++ current;

        if ( current < length ) {
            var name = names[current];
            var task = task_map[name];
            task(done);

        } else {
            callback(first_error, results, errors);
        }
    }

    function done (err) {
        var name = names[current];
        var result = Array.prototype.slice.call(arguments, 1);

        if (result.length <= 1) {
            result = result[0];
        }

        results[name] = result;
        errors[name] = err || null;

        // save the first error
        if ( err && !first_error) {
            first_error = err;
        }

        next();
    };

    next();
};


