# @skema/basic

[`skema`](https://github.com/kaelzhang/skema) type definitions for basic javascript types, including:

- `String` (`'string'`)
- `Number` (`'number'`)
- `Date` (`'date'`)
- `RegExp` (`'regexp'`)
- `Object` (`'object'`)
- `Function` (`'function'`)
- `Error` (`'error'`)
- `Symbol` (`'symbol'`)

## install

```sh
npm i @skema/basic
```

## `LOOSE`

The basic type definitions that it convert the properties of wrong values into the right ones if possible.

```js
import {defaults} from 'skema'
import {LOOSE} from '@skema/basic'

const {
  skema
} = defaults({
  types: LOOSE
})

const User = skema({
  id: Number,       // To use 'number' is also ok
  name: 'string'    // To use String is also ok
})

const user = User.from({
  id: '1',  // id will be converted to `1`
  name: 'Steve'
})

console.log(user)
// {
//   id: 1,
//   name: 'Steve'
// }

const Order = skema({
  id: String,
  createTime: Date
})

Order.from({
  id: '6352534847126241280',
  createTime: 'hahahaha'  // Oh, this date is gone too far!
})
// Error thrown
```

## `STRICT`

The very strict type definition, that it will throw if the given data doesn't match the type of the schema.

```js
import {defaults} from 'skema'
import {STRICT} from '@skema/basic'

const {
  skema
} = defaults({
  types: STRICT
})

const User = skema({
  id: Number,
  name: String
})

const user = User.from({
  id: '1',
  name: 'Steve'
})
// Error thrown
```
