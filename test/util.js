'use strict';

var util = require('../lib/util');
var expect = require('chai').expect;


describe("util.map()", function(){
    it("context", function(){
        var map = { a: 1 };

        util.map(map, function (value, key) {
            expect(this.c).to.equal(3);
            

        }, { c: 3 });
    });
});

describe("util.once()", function(){
    it("run only once", function(){
        var i = 0;
        function abc (n) {
            i += n;
        }

        var abc1 = util.once(abc);

        abc1(2);
        abc1(4);

        expect(i).to.equal(2);
    });
});


describe("util.parallel()", function(done){
    it("complex", function(done){
        util.parallel({
            a: function(done){
                setTimeout(function(){
                    done(1, 11);
                }, 20);
            },

            b: function(done){
                setTimeout(function(){
                    done(2, 22, 222);
                }, 10);
            },

            c: function(done){
                setTimeout(function(){
                    done(null, 33, 333, 3333);
                }, 0);
            }

        }, function(err, results, errors){
            done();
            expect(err).to.equal(2);
            expect(results).to.deep.equal({
                a: 11,
                b: [22, 222],
                c: [33, 333, 3333]
            });
            expect(errors).to.deep.equal({
                a: 1,
                b: 2,
                c: null
            });
        });
    });
});


describe("util.series()", function(done){
    it("complex", function(done){
        util.series({
            a: function(done){
                setTimeout(function(){
                    done(1, 11);
                }, 20);
            },

            b: function(done){
                setTimeout(function(){
                    done(2, 22, 222);
                }, 10);
            },

            c: function(done){
                setTimeout(function(){
                    done(null, 33, 333, 3333);
                }, 0);
            }

        }, function(err, results, errors){
            done();
            expect(err).to.equal(1);
            expect(results).to.deep.equal({
                a: 11,
                b: [22, 222],
                c: [33, 333, 3333]
            });
            expect(errors).to.deep.equal({
                a: 1,
                b: 2,
                c: null
            });
        });
    });
});