'use strict';

exports.once = function (fn) {
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


exports.mix = function (receiver, supplier, override){
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


exports.makeArray = function (subject) {
    return Array.isArray(subject) ? 
        subject :
        subject === undefined || subject === null ?
            [] :
            [subject];
};


