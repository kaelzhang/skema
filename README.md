[![Build Status](https://travis-ci.org/kaelzhang/node-skema.svg?branch=master)](https://travis-ci.org/kaelzhang/node-skema)
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

## Install

```sh
$ npm install skema --save
```

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
    type: 'safe_string'
  }
}

const types = {
  safe_string: {
    set: (v) => {
      return strip_html_tags(v)
    }
  }
}

skema({rules, types})
.parse({
  bar: 1,
  baz: 'i am innocent<script>do_evil()</script>'
})
.then(value => {
  console.log(value.foo)  // 10, make sure the default value
  console.log(value.bar)  // '1', ensure string type
  console.log(value.baz)  // 'i am innocent', the script tag has been stripped
})
.catch((error) => {
  // If error, it means the value of `bar` it not unique.
})
```

## skema({types, rules})

- **types** `{[typeName]: TypeDefinition}`
  - typeName `String` the name of the type
- **rules** `{[key]: RuleProperty}`
  - key `String` the name to match the property of data

Creates the skema instance.

### .parse(data, ...args)

Validates and applies setters. Returns a `Promise`

### .register(typeName, typeDefinition)

Registers a new type, and returns `this`. This method should be called before `.parse()`

### .add(key, ruleProperty)

Adds a new rule, and returns `this`. This method should be called before `.parse()`

## Struct `TypeDefinition`

- **type** `Class=|AnyObject=` optional. If a type definition has a `type` property, a rule can match a type by Constructor.

```js
const path = require('path')
skema({
  types: {
    path: {
      type: path,
      ...
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

```js
const types = {
  types: {
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
      }
    }
  }
}

const rules = {
  name: {
    type: 'username'
  }
}

const check_unique = true

skema({types, rules})
// `check_unique` will be passed into the validator
.parse({name: 'John'}, check_unique)
.then(() => {
  // ok
})
.catch(error => {
  // Maybe the name 'John' already exists.
})
```

- **set** `Array.<Setter>|Setter` A `Setter` receives the value and extra args and returns the altered value or a `Promise`. If there are more than one setter, the previous value has been returned will be passed into the next setter.

## Struct `RuleProperty`

- **type** `String|Object` type to match the `TypeDefinition`. See examples above.
- **default** `default` of RuleProperty will **override** the matched `TypeDefinition`'s `default`.
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

## License

MIT
