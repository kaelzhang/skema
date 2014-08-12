[![NPM version](https://badge.fury.io/js/skema.png)](http://badge.fury.io/js/skema)
[![Build Status](https://travis-ci.org/kaelzhang/node-skema.png?branch=master)](https://travis-ci.org/kaelzhang/node-skema)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-skema.png)](https://gemnasium.com/kaelzhang/node-skema)

# skema

Skema is common abstract node.js methods for validatiors and setters.
	
# Usage
```sh
npm install skema --save
```

```js
var skema = require('skema');
```

# Synopsis

```js
skema(, options).check(data, function(err, value, details){
});
```
