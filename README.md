[![Build Status](https://travis-ci.org/kaelzhang/skema.svg?branch=master)](https://travis-ci.org/kaelzhang/skema)
[![Coverage](https://codecov.io/gh/kaelzhang/skema/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/skema)

# skema

`skema` provides a handy and composable way to validate/transform JavaScript variables:

- **Supports both async and sync flows.** `skema` has two working modes to support either async or sync validators, setters, etc, making it capable with much more complicated challenges.

- **NOT only type checker.** Unlike [TypeScript](https://www.typescriptlang.org/), and many others, `skema` is not only a JavaScript type checker, but also a good solution for your [Anti-Corruption Layer (ACL)](https://docs.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer) to transform and purify the input data.

- **Pluggable basic types.** Even basic types such as `Number` could also be specified if using `skema`

- **Powerful custom types.** Every single type is able to be customized that you can handle almost everything including descriptor, conditions, default values, validators and so on.

- **Composable structures.** You could build a much bigger schema with the small ones into the whole world.

## Install

```sh
npm i skema
```

## Basic Usage

```js
import {skema} from 'skema'

// Schema definitions are ONLY objects.
const User = skema({
  id: Number,
  profile: {
    birth: 'date',   // `Date` is also ok
    name: 'string?', // name is optional
  }
})

// Then use these definitions to purify our data.
const user = User.from({
  id: '1',
  profile: {
    birth: '2017-01-01'
  }
})

console.log(user)
// {
//   id: 1,
//   profile: {
//     birth: Date<'2017-01-01'>  // Date object
//   }
// }
```

## Many Examples

- **Type Definition**
  - [Basic Validation](./examples/basic-validation.js)
  - [Async Validation](./examples/async-validation.js)
  - [Multiple Validators](./examples/multiple-validators.js)
  - [Basic Usage of Setters](./examples/setters.js)
  - [Inherit Another Type](./examples/type-inheritance.js)
- **Shape Definition**

## Documentations

- [Installation](./doc/install.md)
- API References
  - [APIs](./doc/apis.md)
  - [Builtin Types and How to Change Them](./doc/builtins.md)
- [Shape Definition](./doc/shape.md)
- [Error Handling](,/doc/errors.md)
- [Contributing](./doc/contribute.md)

## Related Packages

- [@skema/basic](https://www.npmjs.com/package/@skema/basic) The default built-in types of skema.

## License

MIT
