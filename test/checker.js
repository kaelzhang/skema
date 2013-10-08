'use strict';

var checker = require('../');
var expect = require('chai').expect;

describe("checker.parseSchema()", function(){
    it("validator is always an array", function(){
        var parsed = checker.parseSchema({
            a: {}
        });

        expect(parsed.a.validator).to.deep.equal([]);
    });

    it("setter is always an array", function(){
        var parsed = checker.parseSchema({
            a: {}
        });

        expect(parsed.a.setter).to.deep.equal([]);
    });

    it("regex", function(){
        var parsed = checker.parseSchema({
            a: {
                validator: /abc/
            }
        });

        var validator = parsed.a.validator[0];

        expect(validator.length).to.equal(1);
        expect(validator('aabcde')).to.equal(true);
    });
});

describe(".check()", function(){
    it("complex", function(done){
        var schema = {
            a: {
                default: 'abc',

                setter: function(v){
                    return v + '123'
                }
            },

            b: {
                default: 'b'
            }
        }

        var c = checker(schema);

        c.check({}, function(err, value, detail){
            expect(value.a).to.equal('abc123');
            expect(value.b).to.equal('b');
            expect(detail.a.is_default).to.equal(true);
            expect(detail.b.is_default).to.equal(true);

            done();
        });
    });
});


describe("this.get()", function(){
    it("could get the value of object in setters", function(done){
        var schema = {
            a: {
                default: 'abc',

                setter: function(v){
                    var b = this.get('b');

                    expect(b).to.equal(2);
                    done();
                    
                    return v + '123';
                }
            },

            b: {
                default: 'b'
            }
        }

        var object = {
            a: 1,
            b: 2
        }

        var c = checker(schema);

        c.check(object, function(err, value, detail){
        });
    });

    it("could get the value of object in validators", function(done){
        var schema = {
            a: {
                default: 'abc',

                validator: function(v){
                    var b = this.get('b');

                    expect(b).to.equal(2);
                    done();
                    
                    return true;
                }
            },

            b: {
                default: 'b'
            }
        }

        var object = {
            a: 1,
            b: 2
        }

        var c = checker(schema);

        c.check(object, function(err, value, detail){
        });
    });
});


describe("options", function(){
    describe("options.limit", function(){
        it("should remove extra data, if options.limit -> true", function(done){
            var schema = {
                a: {},
                b: {}
            }

            var c = checker(schema);

            c.check({
                c: 1,
                a: 2

            }, function(err, value, detail){
                expect('c' in value).to.equal(false);
                expect(value.a).to.equal(2);
                

                done();
            });
        });
    });
});




// test error message

// test async setter

// test async validator

