'use strict';

var skema = require('../');
var expect = require('chai').expect;
var types = require('../lib/types')

describe("type", function(){
  it("type: String", function(){
    var type = types().get(String)
    expect(type.set(1)).to.equal('1')
  })

  it("type: 'string'", function(){
    var type = types().get('string')
    expect(type.set(1)).to.equal('1')
  })
})