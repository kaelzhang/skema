[![Build Status](https://travis-ci.org/kaelzhang/skema.svg?branch=master)](https://travis-ci.org/kaelzhang/skema)
[![Coverage](https://codecov.io/gh/kaelzhang/skema/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/skema)

# skema

`skema` provides a handy and composable way to validate/transform JavaScript variables:

- **Supports both async and sync flows.** Skema has two working modes
- **Pluggable basic types and custom types.**
- **Fully customizable error objects.**

## Table of Contents

- [Basic Usage](#usage)
- [API References](#skemaoptions)
- [Many Examples](#examples)

## Basic Usage

```js
import {skema} from 'skema'

// Schema definitions have nothing to do with `skema`,
// they are ONLY objects.
const Profile = {
  name: String,
  birth: Date
}

const User = {
  id: Number,
  profile: Profile
}

// Then use these definitions to purify out data.
const user = skema(User).from({
  id: "1",
  profile: {
    name: 'Steve',
    birth: '2017-01-01'
  }
})

user.id             // 1
user.profile.name   // Steve
user.profile.birth  // Date('2017-01-01')
```


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

- **rules** `?{[key]: TypeDefinition}`
  - key `String` the name to match the property of data
- **types** `?{[typeName]: TypeDefinition}` optional
  - typeName `String` the name of the type
- **clean** `?Boolean=false` If `true`, only the properties that are defined in the `rules` will be validated and manipulated by `.parse()`, but the others will be purified and excluded from the result.
- **parallel** `?Boolean=true` If `true`, all rules will be checked and executed simultaneously, otherwise in the order or the `rules` object. Defaults to `true`

Creates the `Skema` instance.

### .parse(data, ...args)

Validates and applies setters. Returns a `Promise`

`skema` never modifies the original `data`.

### .type(typeName, typeDefinition)

Registers a new type, and returns `this`. This method should be called before `.parse()`

Returns `this`

### .rule(key, typeDefinition)

Adds a new rule, and returns `this`. This method should be called before `.parse()`

Returns `this`

## Struct

### Struct `AsyncOrSyncFunc()`

`skema` supports both async functions and sync functions in almost every circumstances either for validators, setters or others.

### Struct `TypeDefinition`

- **type** `?(string|Object)` optional. If a type definition has a `type` property, a rule can match a type by Constructor.

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
    a: {type: 'path'}, // match the type by name `'path'`
    b: {type: path}    // match the type by the object `path`
  }
})
```

- **when** `?(AsyncOrSyncFunc()|false|any)` To indicate that whether we should process the value.
  - If the value or return value is `false` or `Promise<false>`, then skip;
  - Otherwise, not skip.
- **default** `?(AsyncOrSyncFunc()|Any)` The default value to be used If the `key` is not included in the `data`. It could either be a function that returns the default value or a Promise, or just a value. If you need the default value to be a function, `default` should be a function that returns a function.
- **validate** `?(Array.<Validator>|Validator)` A `Validator` could be:
  - a `AsyncOrSyncFunc(v, ...args)` which accepts the given value of the key, and the "spreaded" `args` of the `.parse(data, ...args)`
  - or a regular expression to test the value.
- **set** `?(Array.<Setter>|Setter)` A `Setter` is a `AsyncOrSyncFunc()` which receives the value and extra args and returns the altered value or a `Promise`. If there are more than one setters, the previous value has been returned will be passed into the next setter.
- **enumerable** `Boolean=true` defaults to `true`
- **configurable** `Boolean=true` defaults to `true`
- **writable** `Boolean=true` defaults to `true`

## Flow

For a given object `data`, and `key`:

1. `when`: First check if we need to process `key`, if skipped then the value will be maintained and untouched
2. `default`: If `key` is not found in `data` and `default` supplied, then assign the default value to `tmpData[key]`. The default value in its rule will override the default definition in its type.
3. `validate`: First we will use the validators from type, then from rule, one by one.
4. `set`: setters from type, then from rule, and change `tmpData[key]`
5. According to `enumerable`, `configurable` and `writable`, create the `finalData`
6. END.

## Examples

### An example about `validate`

```js
const types = {
  username: {
    validate: (username, check_unique) => {
      if (!username) return false
      if (username.length < 5) {
        // Returns a Promise.reject to define a detail error.
        return Promise.reject(
          'username should contain more than 4 chars.')
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

### The Sequences of Validators and Setters.

```js
const types = {
  a: {
    default: 10,
    // validator1
    validate: v => v > 1 ? true : Promise.reject('<= 1'),
    set: v => v + 'a'
  }
}
const rules = {
  foo: {
    type: 'a',
    // validator2
    validate: v => v > 5 ? true : Promise.reject('<= 5'),
    set: v => v + 'b'
  }
}
const s = skema({types, rules})
await s.parse({}) // {foo:'10ab'}

s.parse({foo: 3}).catch(error => {
  console.log(error.message) // '<= 1', validator1 runs first
})

s.parse({foo: 5}).catch(error => {
  console.log(error.message) // '<= 5'
})
```

### Use `when` to skip processing for a certain value.

```js
const rules = {
  foo: {
    when () {
      return this.bar < 10
    },
    // If not skipped, foo always fails
    validate: () => false
  }
}
await skema({rules}).parse({foo: 1, bar: 1})
// {foo: 1, bar: 1}, skipped

await skema({rules}).parse({foo: 1, bar: 10})  // Error thrown
```

### Restrain object properties by using `options.clean`

```js
const rules = {
  // We can simply use an empty TypeDefinition to
  // prevent the value to be purified out
  foo: {},
  bar: {default: 1}
}
const data = {foo: 1, baz: 2}
// The properties that not defined in the rules will be removed.
await skema({rules, clean: true}).parse(data)
// {foo: 1, bar: 1}, baz is purified away
console.log(data) // {foo: 1, baz: 2}, `data` remains unchanged.
```

### skema.JS_TYPES

The built-in types:

- string: both `'string'` and `String` are ok.
- number: `'number'` and `Number`, if the given value is not a number, an error will be rejected
- boolean: `'boolean'` and `Boolean`
- date: `'date'` and `Date`, if the given value is not a date, an error will be rejected.

```js
const rules = {
  foo: {type: Number}
}
await skema({
  rules,
  types: skema.JS_TYPES
}).parse({foo: 'a'})  // Not a number, error thrown
```

## Access to the given value from helper functions

We could use `this[key]` to access to the given value from all helper functions, including `set`, `default`, `when`, `validate`.

Pay attension:

- If `options.parallel=true`(the default value), then `this[key]` is always the given value, even the value of `key` changes after parsing. Because we should not rely on the process sequence of the parsing.
- Otherwise, `this[key]` is the already parsed value of the `key`

## License

MIT
