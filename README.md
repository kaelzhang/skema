[![Build Status](https://travis-ci.org/kaelzhang/node-skema.svg?branch=master)](https://travis-ci.org/kaelzhang/node-skema)
[![Coverage](https://codecov.io/gh/kaelzhang/node-skema/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/node-skema)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/node-skema?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/node-skema)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/skema.svg)](http://badge.fury.io/js/skema)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/skema.svg)](https://www.npmjs.org/package/skema)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/node-skema.svg)](https://david-dm.org/kaelzhang/node-skema)
-->

# skema

`skema` is the collection of common abstract methods for validatiors and setters. All validators and setters could be normal synchronous functions or es7 async funtions or functions which returns `Promise`'s

## Usage

```js
import skema from 'skema'

const rules = {
  foo: {
    default: 10,
    validate: v => v > 0
  },
  bar: {
    type: String,
    validate: v => remote_check_unique_promise(v)
  },
  baz: {
    type: 'safe_string',
    writable: false
  }
}

const types = {
  safe_string: {
    set: v => strip_html_tags(v)
  }
}

const parsed = await skema({rules, types})
.parse({
  bar: 1,
  baz: 'i am innocent<script>do_evil()</script>'
})

console.log(parsed.foo)  // 10, make sure the default value
console.log(parsed.bar)  // '1', ensure string type
console.log(parsed.baz)
// 'i am innocent', the script tag has been stripped

// It will throw because not writable
value.baz = 'i am evil'   
```

## skema(options)

**options**

- **rules** `{[key]: RuleProperty}=`
  - key `String` the name to match the property of data
- **types** `{[typeName]: TypeDefinition}=` optional
  - typeName `String` the name of the type
- **clean** `Boolean=false` If `true`, only the properties that are defined in the `rules` will be validated and manipulated by `.parse()`, but the others will be purified and excluded from the result.
- **parallel** `Boolean=true` If `true`, all rules will be checked and executed simultaneously, otherwise in the order or the `rules` object. Defaults to `true`

Creates the skema instance.

### .parse(data, ...args)

Validates and applies setters. Returns a `Promise`

### .register(typeName, typeDefinition)

Registers a new type, and returns `this`. This method should be called before `.parse()`

Returns `this`

### .add(key, ruleProperty)

Adds a new rule, and returns `this`. This method should be called before `.parse()`

Returns `this`

## Struct `TypeDefinition`

- **type** `(name|RuleProperty::type)=` optional. If a type definition has a `type` property, a rule can match a type by Constructor. And there are several built-in types:
  - string: both `'string'` and `String` are ok.
  - number: `'number'` and `Number`, if the given value is not a number, an error will be rejected
  - boolean: `'boolean'` and `Boolean`
  - date: `'date'` and `Date`, if the given value is not a date, an error will be rejected.

```js
const path = require('path')
skema({
  types: {
    path: {
      type: path,
      set: path.resolve
    }
  },
  rules: {
    // Both a and b can match type 'path'
    a: {type: 'path'},
    b: {type: path}
  }
})
```

- **default** `function()|Any` Default value to use if key is not included in the `data`, or a function that returns the default value or a Promise.
- **validate** `Array.<Validator>|Validator` A `Validator` could be a `function(v, ...args)` which accepts the given value of the key, and the "spreaded" `args` of the `.parse(data, ...args)`, or a regular expression to test the value.
- **enumerable** `Boolean=true` defaults to `true`
- **configurable** `Boolean=true` defaults to `true`
- **writable** `Boolean=true` defaults to `true`

```js
const types = {
  username: {
    validate: (username, check_unique) => {
      if (!username) {
        // Validation fails.
        return false
      }

      if (username.length < 5) {
        // Returns a Promise.reject to define a detail error.
        return Promise.reject('username should contain more than 4 chars.')
      }

      return check_unique
        ? remote_check_unique_promise(username)
        : true
    },

    set: name => `Mr/Mrs ${name}`
  }
}

const rules = {
  name: {type: 'username'}
}

const check_unique = true
const result = await skema({rules, types})
// `check_unique` will be passed into the validator, as the second parameter.
.parse({name: 'John'}, check_unique)

result // {name: 'Mr/Mrs John'}
```

- **set** `Array.<Setter>|Setter` A `Setter` receives the value and extra args and returns the altered value or a `Promise`. If there are more than one setter, the previous value has been returned will be passed into the next setter.

## Struct `RuleProperty`

- **type** `String|Object` type to match the `TypeDefinition`. See examples above.
- **default** `function()|other` default of RuleProperty will **override** the matched `TypeDefinition`'s `default`.
- **validate** Same as `TypeDefinition::validate`, the validators of `TypeDefinition` will be checked first, then validators of `RuleProperty`.
- **set** Same as `TypeDefinition::set` the setters of `TypeDefinition` will be run first.

```js
const types = {
  a: {
    default: 10,
    validate: v => v > 1 ? true : Promise.reject('<= 1'),   // validator1
    set: v => v + 'a'
  }
}

const rules = {
  foo: {
    type: 'a',
    validate: v => v > 5 ? true : Promise.reject('<= 5'),   // validator2
    set: v => v + 'b'
  }
}

const s = skema({types, rules})

s.parse({}).then(value => {
  console.log(value)   // '10ab'
})

s.parse({foo: 3}).catch(error => {
  console.log(error.message)   // '<= 1', validator1 runs first
})

s.parse({foo: 5}).catch(error => {
  console.log(error.message)   // '<= 5'
})
```

- **when** `function()=` If the result is not `true`, then the current key will be skipped.

```js
const rules = {
  foo: {
    when () {
      return false
    }

    // The validation of foo will always be skipped.
    validate () {
      return false
    }
  }
}

skema({rules}).parse({foo: 1})
// {foo: 1}
```

## Access to the given value from helper functions

We could use `this[key]` to access to the given value from all helper functions, including `set`, `default`, `when`, `validate`.

Pay attension:

- If `options.parallel=true`(the default value), then `this[key]` is always the given value, even the value of `key` changes after parsing. Because we should not rely on the process sequence of the parsing.
- Otherwise, `this[key]` is the already parsed value of the `key`

## License

MIT
