'use strict';

var expect = require('chai').expect;
var parser = require('../lib/parser');


describe("parser.parse()", function() {
  it("validate is always an array", function() {
    var parsed = parser.parse({});
    expect(parsed.validate).to.deep.equal([]);
  });

  it("setter is always an array", function() {
    var parsed = parser.parse({});
    expect(parsed.set).to.deep.equal([]);
  });

  it("getter is always an array", function(){
    var parsed = parser.parse({});
    expect(parsed.get).to.deep.equal([]);
  });

  it("regex", function() {
    var parsed = parser.parse({
      validate: /abc/
    });

    var validate = parsed.validate[0];

    expect(validate.length).to.equal(1);
    expect(validate('aabcde')).to.equal(true);
  });
});