[![Build Status](https://travis-ci.org/kaelzhang/skema.svg?branch=master)](https://travis-ci.org/kaelzhang/skema)
[![Coverage](https://codecov.io/gh/kaelzhang/skema/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/skema)

# skema

`skema` provides a handy and composable way to validate/transform JavaScript variables:

- **Supports both async and sync flows.** Skema has two working modes to support either async or sync validators, setters, etc, making it capable with much more complicated challenges.

- **NOT only type checker.** Unlike [TypeScript](https://www.typescriptlang.org/), [joi](https://github.com/hapijs/joi), and many others, Skema is not only a JavaScript type checker, but also a good solution for your [Anti-Corruption Layer (ACL)](https://docs.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer) to transform and purify the input data. And Skema could also be configured as a simple schema validator too.

- **Pluggable basic types.** Even basic types such as `Number` could also be replaced and customized if using Skema. Actually, in the core of Skema, there is NOT a single definition of one type.

- **Powerful custom types.** Every single type is able to be customized that you can handle almost everything including descriptor, conditions, default values, validators and so on.

- **Composable structures.** You could build a much bigger schema with the small ones into the whole world.

## Install

```sh
npm i skema
```

## Basic Usage

[🔬 Live Demo with JsFiddle](https://jsfiddle.net/kaelzhang/0r3g4ogj/)

```js
import {shape} from 'skema'

// Schema definitions are ONLY objects.
const User = shape({
  id: 'number?',
  name: String
})

// Then use these definitions to purify our data.
const user = User.from({
  id: '1',
  name: 'Steve'
})

console.log(user)
// {
//   id: 1,
//   name: 'Steve'
// }

user.id = 'boooom!'
// throw TypeError
// - message: 'not a number'
// - code: 'VALIDATION_FAILS'
```

## Documentations

- API References
  - [APIs](./doc/apis.md)
  - [Builtin Types and How to Change Them](./doc/builtins.md)
- [Shape Definition](./doc/shape.md)
- [Working Mode: Sync or Async](./doc/working-mode.md)
- [Assign a Property after `from()`](./doc/assign.md)
- [Error Handling](./doc/errors.md)
- [Contributing](./doc/contributing.md)

## Many Examples

- **Shape Definition**
  - [Purify an Object Against a Shape🔬](https://jsfiddle.net/kaelzhang/0wosjdo9/)
  - [Default Value of a Property🔬](https://jsfiddle.net/kaelzhang/zhu8crde/)
  - [Optional Properties🔬](https://jsfiddle.net/kaelzhang/pesgkw9c/)
  - [Skip Processing a Property🔬](https://jsfiddle.net/kaelzhang/joq5vdd7/)
  - [Properties Descriptors: Non-Enumerable Properties, ...🔬](https://jsfiddle.net/kaelzhang/yhj2xj72/)
- **Type Definition**
  - [Basic Validation](./examples/basic-validation.js) | [Live Demo🔬 ](https://jsfiddle.net/kaelzhang/2au1on62/)
  - [Async Validation](./examples/async-validation.js) | [Live Demo🔬](https://jsfiddle.net/kaelzhang/1rr5asyb/)
  - [Multiple Validators](./examples/multiple-validators.js)
  - [Basic Usage of Setters](./examples/setters.js)
  - [Inherit Another Type](./examples/type-inheritance.js)
  - [Declare a Type Alias to Make a Shortcut (Live Demo🔬)](https://jsfiddle.net/kaelzhang/7d5u4z0s/)
  - [Use Skema as the Strict Type Checker](./examples/strict-basics.js) | [Live Demo🔬](https://jsfiddle.net/kaelzhang/14y4s0e9/)
- [Errors🔬](https://jsfiddle.net/kaelzhang/scvLn8Ly/)

## Related Packages

- [@skema/basic](https://www.npmjs.com/package/@skema/basic) The default built-in javascript types of skema.

## License

MIT
