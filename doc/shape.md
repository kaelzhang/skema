# Shape

This document will show you:

- How to define a shape.
- How the descriptor properties of a type work with shapes.

There are 3 kinds of shapes, object, array and their combination.

## Object Shape

Let us look into an example of the shape definition step by step.

```js
import {shape} from 'skema'

const User = shape({
  // 1
  id: Number,
  // 2
  profile: shape({
    // 3
    birth: 'date',
    // 4
    name: 'string?'
  })
})
```

1. The user id is a number, and `Number` is an alias of the built-in number type.

2. To define a deep shape, just make the object deeper.

3. `'date'` is also an alias

4. `'string?'` is equivalent to:

```js
type({
  type: 'string',
  optional: true
})
```

For more information about optional type, see [optional](#optional) section below.

```js
const user = User.from({
  id: '123',
  profile: {
    birth: '1999-01-01',
    name: 'Jack'
  }
})
```

Then
- `user.id` is the number `123`
- `user.profile.birth` is an `Date` object which time is `1999-01-01`
- `user.profile.name` is `'Jack'`

### optional

And how about the given data without id.

```js
User.from({
  profile: {
    birth: '1999-01-01',
    name: 'Jack'
  }
})
// throw Error
// - code: NOT_OPTIONAL
// - message: key 'id' is not optional
// - path: ['id']
// - key: 'id'
```

It throws an error, what happens?

The built-in type `Number` is not optional. If a property of a shape is not optional, and the given value does not contain the property, it will fail.

To fix this, you should either make the data right or change the shape:

```js
shape({
  // use string syntactic suger
  id: 'number?'
})

shape({
  // inherit a skema
  id: type({
    type: Number,
    optional: true
  })
})
```

More information about Type Inheritance, see [this example](../examples/type-inheritance).

### default

### when

### configurable

### enumerable

### writable

## Array Shape
