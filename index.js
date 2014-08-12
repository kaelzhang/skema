'use strict';

var Skema = require('./lib/skema');
var parser = require('./lib/parser');

function skema (options) {
  options || (options = {});
  options.rule || (options.rule = {});
  options.context || (options.context = {});
  return new Skema(options);
};

module.exports = skema;
skema.Skema = Skema;
skema.parse = parser.parse;
