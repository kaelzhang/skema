# Working Mode

By default, `skema` works synchronously.

## Woking Asychronously

There are TWO ways to make Skema run synchronously.

1. Specify `options` parameter of `.from(raw, options)`
2. Change the default settings.

```js
import {type} from 'skema'
const Type = type({
  set: v => v + 1
})

Type.from(1)  // 2

Type.from(1, {async: true})
.then(v => {
  console.log(v)  // 2
})
```

```js
import {defaults} from 'skema'
import {LOOSE} from '@skema/basic'

const {
  type,
  shape
} = defaults({
  async: true,
  types: LOOSE
})

const UserName = type({
  type: String,
  validate (name) {
    if (name.length < 4) {
      throw 'name is too short'
    }

    return new Promise((resolve, reject) => {
      isUniqueFromRemoteHTTPServer(name, (err, unique) => {
        if (err) {
          return reject(err)
        }
        resolve(unique)
      })
    })
  },
  set (name) {
    // Oh, he is the admin, and make him different!
    return name === 'isaac'
      ? 'Isaac Z. Schlueter'
      : name
  }
})

const User = shape({
  name: UserName
})

User.from({
  name: 'izs'
})
.catch(console.error)
// Error
// - code: 'CUSTOM_ERROR',
// - message: 'name is too short'
// - path: ['name'],
// - key: 'name',
// - value: 'izs',
// - parent: {name: 'izs'}

User.from({
  name: 'isaac'
})
.then(console.log)
// {name: 'Isaac Z. Schlueter'}
```
