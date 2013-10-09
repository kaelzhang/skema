'use strict';

var expect = require('chai').expect;
var schema = require('../lib/schema');


describe("schema.parseSchema()", function(){
    it("validator is always an array", function(){
        var parsed = schema.parseSchema({
            a: {}
        });

        expect(parsed.a.validator).to.deep.equal([]);
    });

    it("setter is always an array", function(){
        var parsed = schema.parseSchema({
            a: {}
        });

        expect(parsed.a.setter).to.deep.equal([]);
    });

    it("regex", function(){
        var parsed = schema.parseSchema({
            a: {
                validator: /abc/
            }
        });

        var validator = parsed.a.validator[0];

        expect(validator.length).to.equal(1);
        expect(validator('aabcde')).to.equal(true);
    });
});