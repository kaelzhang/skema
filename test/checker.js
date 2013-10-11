'use strict';

var checker = require('../');
var expect = require('chai').expect;

describe(".check()", function(){
    it("setter and is_default", function(done){
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

    it("array of error messages", function(done){
        var schema = {
            a: {
                validator: [
                    function(v){
                        return !!v
                    },

                    function(v){
                        return v.length > 2;
                    }
                ],

                message: [
                    'a',
                    'b'
                ]
            }
        };

        var c = checker(schema);

        c.check({
            a: ''
        }, function(err){
            expect(err).to.equal('a');

            c.check({
                a: 'a'
            }, function(err){
                expect(err).to.equal('b');
                
                done();
            });
        })
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


    it("could access changed value", function(done){
        var schema = {
            a: {
                default: 'abc',
                setter: [
                    function (v) {
                        expect(this.get('a')).to.equal('abc');
                        
                        return 'a'
                    },

                    function (v) {
                        expect(this.get('a')).to.equal('a');
                        
                        return 'aa';
                    }
                ]
            },

            b: {
                default: 'b',
                validator: function (v) {
                    expect(this.get('b')).to.equal(2);
                    
                    expect(this.get('a')).to.equal('aa');
                    done();
                    
                    return true;
                }
            }
        }

        var object = {
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

            var c = checker(schema, {
                limit: true
            });

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

    describe("options.check_all", function(){
        it("will display all errors", function(done){
            var schema = {
                a: {
                    validator: function (v, is_default) {
                        return !is_default;
                    },

                    message: 'a'
                },

                b: {
                    validator: function(v, is_default){
                        return !is_default;
                    },

                    message: 'b'
                }
            };

            var c = checker(schema, {
                check_all: true
            });

            c.check({}, function(err, results, details){
                done();

                expect(err).to.equal('a');
                expect(results.a).to.equal(undefined);
                expect(results.b).to.equal(undefined);
                expect(details.a.is_default).to.equal(true);
                expect(details.a.error).to.equal('a');
            })
        });
    });
});




// test error message

// test async setter

// test async validator

