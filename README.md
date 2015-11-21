[![Build Status](https://travis-ci.org/kaelzhang/node-skema.png?branch=master)](https://travis-ci.org/kaelzhang/node-skema)
<!-- 
[![NPM version](https://badge.fury.io/js/skema.png)](http://badge.fury.io/js/skema)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-skema.png)](https://gemnasium.com/kaelzhang/node-skema) -->

# skema

Skema is common abstract node.js methods for validatiors and setters.
	
# Usage
```sh
npm install skema --save
```

## skema(options)

```js
var skema = require('skema');
var s = skema({
  validate: function(v){
    var done = this.async();
    remoteChecking(v, function(err){
      done(err);
    });
  },
  set: function(v){
    return v + 1;
  },
  get: function(v){
    return v - 1;
  }
});

s.validate(1, function(err){
  console.log(err);
});

s.set(1, function(err, v){
  console.log(v); // 2
  s.get(v, function(err){
    console.log(v); // 1
  });
});
```

## Synopsis

```js
var s = skema(rule).context(context)
```

- **rule**
  - **rule.validate**: `function(v)|RegExp|Array` Could be an validate function, or a regular expression, or an array of them.
  - **rule.set**: `function(v)|Array.<function(v)>` 
  - **rule.get**: `function(v)|Array.<function(v)>`

We can use the common `this.async()` style in each function of `rule.validate`, `rule.set` or `rule.get` to turn the function into an asynchronous one. 

For details, see [`wrap-as-async`](https://www.npmjs.com/package/wrap-as-async).

- **context** 


```js
var done = this.async();
```

to turn the either one of the tree into an async method, as well as the familiar way of node.js.

## .validate(value, [args], callback)

- value
- args `Array=` Extra arguments that will be passed into `rule.validate` for extension.
- callback `function(err)`

## .set(value, [args], callback)

