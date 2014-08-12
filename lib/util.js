'use strict';

var util = module.exports = {};

util.once = function(fn) {
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


util.map = function(map, interator, context) {
  var key;

  for (key in map) {
    interator.call(context || null, map[key], key);
  }
};
