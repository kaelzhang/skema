# API References

The very detail and verbose references of the APIs.

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

And in all `AsyncOrSyncFunc`s, we could simply throw an error if something is wrong:

```js
...
validate (v) {
  if (v < 0) {
    throw 'less than 0'
  }

  return true
},
...
```

### struct `TypeDefinition`

Used for value validation and transformation:
- **validate** `?(Array<Validator>|Validator)` A `Validator` could be:
  - a `AsyncOrSyncFunc(v, ...args)` which accepts the given value of the key, and the "spreaded" `args` of the `.from(data, ...args)`
  - or a regular expression to test the value.
- **set** `?(Array.<Setter>|Setter)` A `Setter` is a `AsyncOrSyncFunc()` which receives the value and extra args and returns the altered value or a `Promise`. If there are more than one setters, the previous value has been returned will be passed into the next setter.

Used for traversing schema shape:
- **when** `?(AsyncOrSyncFunc()|false|any)` To indicate that whether we should process the value.
  - If the value or return value is `false` or `Promise<false>`, then skip processing the current key;
  - Otherwise, not skip.
- **default** `?(AsyncOrSyncFunc()|any)` The default value to be used If the `key` is not included in the `parent`. It could either be a function that returns the default value or a Promise, or just a value. If you need the default value to be a function, `default` should be a function that returns a function.
- **optional** `?Boolean=false` Whether the property is optional. Notice that if the default value is provided, then it will always be optional. Defaults to `false`
- **enumerable** `?Boolean=true` defaults to `true`
- **configurable** `?Boolean=true` defaults to `true`
- **writable** `?Boolean=true` defaults to `true`

## class `Skema`

### method `.from()`

```js
.from(value [,...args]): any | Promise
```

Processes (validating and transforming) the given `value`.

### method `.optional()`

```js
.optional(): Skema
```

Creates a new `Skema` based on the current one but is optional.

### method `.required()`

```js
.required(): Skema
```

Creates a new `Skema` based on the current one but is required.

### method `.enumerable()`
### method `.writable()`
### method `.configurable()`

```js
.enumerable(enumerable: boolean): Skema
.writable(writable: boolean): Skema
.configurable(configurable: boolean): Skema
```

Creates a new `Skema` based on the current one but with the new property value of object descriptors.

## type()

```js
type(definition: TypeDefinition): Skema
```

A type is the minimum unit to describe a single variable. Method `type()` accepts an object of `TypeDefinition` and returns a `Skema`.

A type defines two major kinds of things:
- How we should manage the value:
  - **validate**
  - **set**
- And how we should deal with it if it is a member of an object or an array. The following configurations do not have any effects if we test against the type alone. And we will talk about these descriptors later with [shape definition](./shape.md)
  - **when**
  - **default**
  - **optional**
  - **enumerable**
  - **writable**

Basic usage:

```js
const TypeNumber = type({
  validate: v => typeof v === 'number'
})

TypeNumber.from(1)    // 1
TypeNumber.from('1')  // Error thrown
```

#### Examples

- [Basic Validation](../examples/basic-validation.js)
- [Async Validation](../examples/async-validation.js)
- [Multiple Validators](../examples/multiple-validators.js)
- [Basic Usage of Setters](../examples/setters.js)
- [Inherit Another Type](../examples/type-inheritance.js)

## shape()

```js
shape(object: ShapeStructure): Skema
```

Defines a skema structure, and the `ShapeStructure` is:

```ts
interface ShapeStructure {
  [string]: Skema | SkemaAlias | ShapeStructure
}
```

```js
const Address = shape({
  id: Number,
  address: {
    postCode: Number,
    text: type({
      set: v => v.slice(0, 20)
    })
  }
})

Address.from({
  id: '123',
  address: {
    postCode: '210000',
    text: 'a ..... very .... long .... address'
  }
})
// {
//   id: 123,
//   address: {
//     postCode: 210000,
//     text: 'address of length less than 100'
//   }
// }
```

The detail behavior how shape works, see [Skema Shape](./shape.md).

#### Examples

## declare()

```js
declare(name: SkemaAlias, skema: Skema): void
declare(names: SkemaAlias[], skema: Skema): void
```

Declares the alias for a certain skema, and the alias could be used directly in shape definition and `skema(skemaAlias)`

- **SkemaAlias** `string | object`

```js
import path from 'path'
const Path = type({
  set: pathname => path.resolve(__dirname, pathname)
})

declare(['path', path], Path)

const README = skema({
  // And we could just use nodejs `path` object as the type
  pathname: path,
  // The `String` here is an alias of the built-in string type.
  content: String
})

README.from({
  pathname: '../README.md',
  content: '...'
})
// {
//   pathname: '/path/to/skema/README.md',
//   content: '...'
// }
```

## arrayOf()

```js
arrayOf(subject: Skema | SkemaAlias): Skema
```

Creates a `Skema` which presents a special array [shape](./shape.md) that all of its items are of type `subject`.

## objectOf()

```js
objectOf(subject: Skema | SkemaAlias): Skema
```

Creates a `Skema` which presents a special object [shape](./shape.md) that all of its property values are of type `subject`.

## skema()

```js
skema(subject: ShapeStructure | Skema | SkemaAlias): Skema
```

The over-for-all method to:

- The alias of `.shape()`
- Make sure an object is a `Skema`
- Get the `Skema` object by its alias name.

```js
skema(Number).from('1')  // 1
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

Changes the default setting of skema, and creates

- **options** `object`
  - **clean** `?boolean=false` If true, the properties that not defined in the shape will be purified out.
  - **async** `?boolean=false` If true, skema will works in async mode.
