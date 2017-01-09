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

Skema is the collection of common abstract methods for validatiors and setters.

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
  'safe_string': {
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

## skema({rules, types})

- **rules** `{[key]: RuleProperty}`
  - key `String` the name to match the property of data
- **types** `{[typeName]: TypeDefinition}`
  - typeName `String` the name of the type

Creates the skema instance.

### .parse(data, ...args)


Validates and applies setters. Returns a `Promise`

### .register(typeName, typeDefinition)

Registers a new type, and returns `this`. This method should be called before `.parse()`

### .add(key, ruleProperty)

Adds a new rule, and returns `this`. This method should be called before `.parse()`

## Struct `RuleProperty`

## Struct `TypeDefinition`

## License

MIT
