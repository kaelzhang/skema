[![Build Status](https://travis-ci.org/kaelzhang/node-checker.png?branch=master)](https://travis-ci.org/kaelzhang/node-checker)

(THIS DOCUMENTAION IS NOT FINISHED YET.)

# checker

Checker is the collection of common abstract node.js methods for validatiors and setters.
	
# Usage
```sh
npm install checker --save
```

```js
var checker = require('checker');
```

# Synopsis

```js
checker(schema, options).check(data, callback);
```

# Validation, Error Messages

## Simple synchronous validators

```js
var schema = {
	username: {
		validator: function(value){
			return /^[a-zA-Z0-9]{6,}$/.test(value);
		},
		message: 'Username must only contain letters, numbers; Username must contain at least 6 charactors'
	}
};

var c = checker(schema);

c.check({
	username: 'a'
}, function(err){
	if(err){
		console.log(err); // Then, `schema.username.message` will be displayed.
	}
});
```

## Regular expressions as validators

The error hint of the example above is bad, because we want to know the very certain reason why we are wrong.

The `schema` below is equivalent to the one of the previous section:

```js
{
	validator: [
		function(value){
			return value && value.length > 5;
		}, 
		/^[a-zA-Z0-9]+$/
	],
	message: ['Username must contain at least 6 charactors', 'Username must only contain letters and numbers'];
}
```

## Asynchronous validators

```js
{
	validator: function(value){
		var done = this.async();
		// this is an async method, and takes sooooo long...
		remote_check(value, function(err){
			done(err); // `err` will pass to the `callback`
		});
	}
}
```


# Programmatical Details

## Options

#### options.default_message `String`

Default error message

#### options.parallel `Boolean=false`

#### options.limit `Boolean=false`

#### options.check_all `Boolean=false`



## Schema Structures 

```js
{
	<name>: <rule>
}
```


Where `rule` might contains (all properties are optional):

#### validator 

- `RegExp` The regular exp that input must matches against
- `Function` Validation function. If `arguments.length === 3`, it will be considered as an async methods
- `Array.<RegExp|Function>` Group of validations. Asks will check each validator one by one. If validation fails, the rest validators will be skipped.
- See sections above for details
	
#### setter `Function|Array.<Function>`

See sections above for details.

#### message `String`

Default error message

#### default: `String`
