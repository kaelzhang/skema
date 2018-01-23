# Working Mode

By default, `skema` works synchronously.

## Woking Asychronously

```js
import {defaults} from 'skema'
import {LOOSE} from '@skema/basic'

const {
  skema
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
    return name === 'isaac'
      ? 'Isaac Z. Schlueter'
      : name
  }
})

const User = skema({
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
