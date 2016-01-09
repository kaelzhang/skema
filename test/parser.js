'use strict';

var expect = require('chai').expect;
var parser = require('../lib/parser');


describe("parser.parse_validators()", function() {
  it("always an array", function(){
    var parsed = parser.parse_validators(undefined);
    expect(parsed).to.deep.equal([]);
  });

  it("regex", function() {
    var parsed = parser.parse_validators(/abc/);

    var validate = parsed[0];

    expect(validate.length).to.equal(1);
    expect(validate('aabcde')).to.equal(true);
  });
});


describe("parser.parse_funcs()", function(){
  it("always be an array", function(done){
    var parsed = parser.parse_funcs(undefined)
    expect(parsed).to.deep.equal([])
    done()
  })

  it("should filter non-function mutators", function(done){
    function foo () {
    }

    var parsed = parser.parse_funcs([
      /abc/, foo
    ])
    expect(parsed).to.deep.equal([foo])
    done()
  })
})
