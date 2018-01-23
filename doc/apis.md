# API References

## APIs

```js
import {
  skema,
  type,
  shape,
  arrayOf,
  objectOf,
  any,
  declare,
  defaults
} from 'skema'
```

## Structs

**TL;NR**

### `AsyncOrSyncFunc()`

`skema` supports both async functions and sync functions in almost every circumstances either for `when`, `default`, `validate` and `set`.

And in all `AsyncOrSyncFunc`s, we could access

- **this.parent** `object | null` the current object that is processing.
- **this.key** `string | null` the corresponding property key of the current value.
- **this.path** `Array<string>` the access path of from which way we get there.

### struct `TypeDefinition`

- **when** `?(AsyncOrSyncFunc()|false|any)` To indicate that whether we should process the value.
  - If the value or return value is `false` or `Promise<false>`, then skip processing the current key;
  - Otherwise, not skip.
- **default** `?(AsyncOrSyncFunc()|any)` The default value to be used If the `key` is not included in the `parent`. It could either be a function that returns the default value or a Promise, or just a value. If you need the default value to be a function, `default` should be a function that returns a function.
- **validate** `?(Array<Validator>|Validator)` A `Validator` could be:
  - a `AsyncOrSyncFunc(v, ...args)` which accepts the given value of the key, and the "spreaded" `args` of the `.from(data, ...args)`
  - or a regular expression to test the value.
- **set** `?(Array.<Setter>|Setter)` A `Setter` is a `AsyncOrSyncFunc()` which receives the value and extra args and returns the altered value or a `Promise`. If there are more than one setters, the previous value has been returned will be passed into the next setter.
- **enumerable** `?Boolean=true` defaults to `true`
- **configurable** `?Boolean=true` defaults to `true`
- **writable** `?Boolean=true` defaults to `true`

## class `Skema`

### `.from(value [,...args]): any | Promise`

## declare()

```js
declare(name: SkemaAlias, skema: Skema): void
declare(names: SkemaAlias[], skema: Skema): void
```

- **SkemaAlias** `string | object`

```js
import path from 'path'
const Path = type({
  set: pathname => path.resolve(__dirname, pathname)
})

declare(['path', path], Path)

const README = skema({
  // And we could just use nodejs `path` object as the type
  pathname: path
})

README.from({
  pathname: '../README.md'
})
// {
//   pathname: '/path/to/skema/README.md'
// }
```

## shape()

```js
shape(object): Skema
```

## arrayOf()

```js
arrayOf(subject: Skema | SkemaAlias)
```

## objectOf()

```js
arrayOf(subject: Skema | SkemaAlias)
```

## skema()

```js
skema(subject: array | object | string): Skema
```

## type()

```js
type(definition: TypeDefinition): Skema
```

## defaults(options)

```js
const {
  skema,
  shape,
  arrayOf,
  objectOf,
  type,
  any
} = defaults(options)
```

- **options** `object`
  - **clean** `?boolean=false`
  - **async** `?boolean=false`
