'use strict';

var util = require('../lib/util');
var expect = require('chai').expect;


describe("util.map()", function() {
  it("context", function() {
    var map = {
      a: 1
    };

    util.map(map, function(value, key) {
      expect(this.c).to.equal(3);


    }, {
      c: 3
    });
  });
});

describe("util.once()", function() {
  it("run only once", function() {
    var i = 0;

    function abc(n) {
      i += n;
    }

    var abc1 = util.once(abc);

    abc1(2);
    abc1(4);

    expect(i).to.equal(2);
  });
});
