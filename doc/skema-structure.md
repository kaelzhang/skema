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
