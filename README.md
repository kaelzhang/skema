[![Build Status](https://travis-ci.org/kaelzhang/node-skema.png?branch=master)](https://travis-ci.org/kaelzhang/node-skema)
<!-- 
[![NPM version](https://badge.fury.io/js/skema.png)](http://badge.fury.io/js/skema)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-skema.png)](https://gemnasium.com/kaelzhang/node-skema) -->

# skema

Skema is common abstract node.js methods for validatiors and setters.

With skema, we could define multiple setter, getters, and validators, either synchronous or asynchronous.
	

## Install

```sh
npm install skema --save
```

## Usage

```js
skema(rule).context(context)
```

## Example

```js
var skema = require('skema');
var rule = {
  get: function(v){
    return v - 1;
  },

  set: function(v){
    // turns the setter into an asynchronous method
    var done = this.async();
    setTimeout(function(){
      done(null, v * v);
    }, 10);
  },

  // There could be multiple validators
  validate: [
    function (v) {
      // method `get_min()` is defined by `.context()`
      var min = this.get_min();

      if (v < min) {
        return new Error('v less than ' + min);
      }

      return true;
    },

    function (v) {
      var done = this.async();
      remoteChecking(v, function(err){
        done(err);
      });
    }
  ]
};

var s = skema(rule)
  // So that we could use `this.get_min()` in
  // setters, getters, or validators
  .context({
    min: 1,
    get_min: function () {
      return this.min;
    }
  });

s.validate(1, function(err){
  console.log(err); // error: 'v less than 1'
});

s.set(2, function(err, v){
  console.log(v); // 4 (2 * 2)

  s.get(v, function(err){
    console.log(v); // 3 ( 4 - 1)
  });
});
```

- **rule**
  - **rule.validate**: `function(v)|RegExp|Array` Could be an validate function, or a regular expression, or an array of them.
  - **rule.set**: `function(v)|Array.<function(v)>` if there is more than one setters, the result value of the previous setter will pass into the next setter.
  - **rule.get**: `function(v)|Array.<function(v)>` which is similar to `rule.set`

Either of the three subject is optional.

We can use the common `this.async()` style in each function of `rule.validate`, `rule.set` or `rule.get` to turn the function into an asynchronous one.

For details, see [`wrap-as-async`](https://www.npmjs.com/package/wrap-as-async).

### .context(context)

- **context** `Object` defines extra custom context that could be accessed by `this` object inside `rule.validate`, `rule.set` and `rule.get`

Returns `this`

### .validate(value, [args], callback)

- **value**
- args `Array=` optional. extra arguments to be passed into each `rule.validate` function
- callback `function(err)`

Validates the given value.

### .set(value, [args], callback)

Sets the value.

### .get(value, [args], callback)

Gets the value.

