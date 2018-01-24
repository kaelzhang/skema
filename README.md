[![Build Status](https://travis-ci.org/kaelzhang/skema.svg?branch=master)](https://travis-ci.org/kaelzhang/skema)
[![Coverage](https://codecov.io/gh/kaelzhang/skema/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/skema)

# skema

`skema` provides a handy and composable way to validate/transform JavaScript variables:

- **Supports both async and sync flows.** `skema` has two working modes to support either async or sync validators, setters, etc, making it capable with much more complicated challenges.

- **NOT only type checker.** Unlike [TypeScript](https://www.typescriptlang.org/), and many others, `skema` is not only a JavaScript type checker, but also a good solution for your [Anti-Corruption Layer (ACL)](https://docs.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer) to transform and purify the input data.

- **Pluggable basic types.** Even basic types such as `Number` could also be specified if using `skema`

- **Powerful custom types.** Every single type is able to be customized that you can handle almost everything including descriptor, conditions, default values, validators and so on.

- **Composable structures.** You could build a much bigger schema with the small ones into the whole world.

## Basic Usage

```js
import {skema} from 'skema'

// Schema definitions are ONLY objects.
const User = {
  id: Number,
  profile: {
    birth: 'date',   // `Date` is also ok
    name: 'string?', // name is optional
  }
}

// Then use these definitions to purify our data.
const user = skema(User).from({
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

- [Type Definition]()

## Documentations

- References
  - [APIs](./doc/apis.md)
