# Built-in Types and Type Aliases

Built-in types are actually [`SkemaAlias`](./apis.md#declare)es which declared by [`declare()`](./apis.md#declare)

## Declare Custom Type Aliases

```js
import {
  defaults
} from 'skema'

const {
  shape,
  declare
} = defaults() // Creates methods with no builtin types.

shape({
  foo: 'number'
})
// throw Error
// - code: 'UNKNOWN_TYPE'
```

```js
const isNaN = typeof Number.isNaN === 'function'
  ? Number.isNaN
  : n => n === n

// declare a type alias
declare('number', {
  validate (v) {
    if (typeof v === 'number' && !isNaN(v)) {
      return true
    }

    throw 'not a number'
  }
})

const Shape = shape({
  foo: 'number'
})

Shape.from({foo: '1'})
// throw Error
// - code: 'CUSTOM_ERROR'
// - message: 'not a number'
```

[Live Demo🔬](https://jsfiddle.net/kaelzhang/7d5u4z0s/)

## Built-in Types

The default built-in types are loose types, which means they try to convert properties of input values into the right ones if possible.

see [@skema/basic](../packages/basic) for details.

### Uses Skema as Type Checker

[Live Demo🔬](https://jsfiddle.net/kaelzhang/14y4s0e9/)
