'use strict';

var One = require('../').Skema;
var expect = require('chai').expect;

describe(".validate", function(){
  it("async validate", function(done){
    var rule = {
      validate: function (value) {
        var done = this.async();
        setTimeout(function () {
          done(value > 0 ? null : true);
        }, 0);
      }
    };

    var c = new One({
      rule: rule,
      context: {}
    });

    c.validate(-1, [], function (err) {
      expect(err).not.to.equal(null);
      
      c.validate(1, function (err) {
        expect(err).to.equal(null);
        done();
      });
    });
  });

  it("sync validate", function(done){
    var rule = {
      validate: function (v) {
        return v > 0;
      }
    };

    var c = new One({
      rule: rule,
      context: {}
    });

    c.validate(-1, [], function (err) {
      expect(err).not.to.equal(null);
      
      c.validate(1, function (err) {
        expect(err).to.equal(null);
        done();
      });
    });
  });

  var rule = {
    validate: [
      function (v) {
        if (v <= 0) {
          return 'must > 0';
        }
        return true;
      },
      function (v) {
        var done = this.async();
        if (v <= 10) {
          return done('must > 10');
        }

        done();
      },
      /\d{3,}/
    ]
  };

  var cases = [
    [-1, 'must > 0'],
    [1, 'must > 10'],
    [11, true],
    [100, null]
  ];

  var one = new One({
    rule: rule,
    context: {}
  });

  cases.forEach(function (c) {
    var v = c[0];
    var e = c[1];
    it("array validate:" + v, function(done){
      one.validate(v, [], function (err) {
        expect(err).to.equal(e);
        done();
      });
    });
  });

  it("context", function(done){
    var rule = {
      validate: function (value) {
        var done = this.async();
        if (this.skip()) {
          return done(null);
        }

        setTimeout(function () {
          done(value > 0 ? null : true);
        }, 0);
      }
    };

    var skip;
    var c = new One({
      rule: rule,
      context: {
        skip: function () {
          return skip;
        }
      }
    });

    c.validate(-1, [], function (err) {
      expect(err).not.to.equal(null);
      skip = true;
      c.validate(-1, function (err) {
        expect(err).to.equal(null);
        done();
      });
    });
  });
});


describe(".get/.set", function(){
  it("sync", function(done){
    var rule = {
      set: function (v) {
        return v + 1;
      }
    };

    var one = new One({
      rule: rule,
      context: {}
    });

    one.set(1, [], function (err, v) {
      expect(err).to.equal(null);
      expect(v).to.equal(2);
      done();
    });
  });

  it("async", function(done){
    var rule = {
      set: function (v) {
        var done = this.async();
        if (v <= 0) {
          return done('must > 0'); 
        }

        setTimeout(function () {
          done(null, v + 1);
        }, 10);
      }
    };

    var one = new One({
      rule: rule,
      context: {}
    });

    one.set(1, [], function (err, v) {
      expect(err).to.equal(null);
      expect(v).to.equal(2);

      one.set(-1, [], function (err, v) {
        expect(err).to.equal('must > 0');
        done();
      });
    });
  });

  it("context", function(done){
    var rule = {
      set: function (v) {
        var done = this.async();
        var self = this;
        setTimeout(function () {
          done(null, v + self.plus());
        }, 10);
      }
    };

    var one = new One({
      rule: rule,
      context: {
        plus: function () {
          return plus;
        }
      }
    });
    var plus = 1;

    one.set(1, [], function (err, v) {
      expect(err).to.equal(null);
      expect(v).to.equal(2);

      plus = 2;
      one.set(1, [], function (err, v) {
        expect(err).to.equal(null);
        expect(v).to.equal(3);
        done();
      });
    });
  });
});
