[![NPM version](https://badge.fury.io/js/checker.png)](http://badge.fury.io/js/checker)
[![Build Status](https://travis-ci.org/kaelzhang/node-checker.png?branch=master)](https://travis-ci.org/kaelzhang/node-checker)
[![Dependency Status](https://gemnasium.com/kaelzhang/node-checker.png)](https://gemnasium.com/kaelzhang/node-checker)

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
checker(schema, options).check(data, function(err, value, details){
});
```

### err `mixed`

### results `Object`

The parsed object.

### details `Object`

```
{
	<name>: <detail>
}
```

- `detail.value` `mixed` the parsed value
- `detail.is_default` `Boolean` if the current property is defined in `schema`, but the input data doesn't have it, then the value will be `true`
- `detail.is_cooked` `Boolean` if there're any setters, it will be `true`
- `detail.origin` the origin value of the property
- `detail.error` the error belongs to the current property. If not exists, it will be `null`


# Validation, Error Messages

## Simple synchronous validators

```js
var schema = {
	username: {
		validator: function(value){
			return /^[a-zA-Z0-9]{6,}$/.test(value);
		},
		message: 'Username must only contain letters, numbers; ' 
			+ 'Username must contain at least 6 charactors'
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
	message: [
		'Username must contain at least 6 charactors', 
		'Username must only contain letters and numbers'
	];
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

By default, `checker` will check each properties in series, 

#### options.limit `Boolean=false`

If `options.limit` is `true` and a certain property of the input data is not defined in the `schema`, the property will be removed.

Default to `false`.

#### options.check_all `Boolean=false`

By default, `checker` will exit immediately at the first error. But if `options.check_all` is `true`, it will parse all the properties, and collect every possible error.

#### options.context `Object`

See sections below.

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


## `this` object inside validators and setters

Inside validators(`rule.validator`) and setters(`rule.setter`), there're several opaque methods

### this.async()

Generate the `done` function to make the validator or setter become an async method.

	var done = this.async();
	
For details, see the demos above.

### this.get(name)

The value of the input object by name

### this.set(name, value)

Change the value of the specified property of the input object.

```
{
	username: {
	},
	
	password: {
		validator: function(value){
			var username = this.get('username');
			
			// Guests are welcome even without passwords
			return value || username === 'guest';
		}
	}
}
```

Notice that you'd better use `this.get` and `this.set` with the `options.parallel` setting as `false`(the default value). Otherwise, it might encounter unexpected situations, because the value of the object is ever changing due to the setter.

So, use them wisely.

### this.context `Object`

The `options.context` itself.



