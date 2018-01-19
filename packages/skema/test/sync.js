const test = require('ava')
const {defaults} = require('../src')

test.only('skema', async t => {
  const {
    skema,
    formula
  } = defaults({
    types: {
      number: {
        type: Number,
        skema: {
          set: Number
        }
      },
      // string: {
      //   type: String,
      //   skema: {
      //     set: String
      //   }
      // }
    }
  })

  const User = skema({
    id: Number,
    // name: String
  })

  const user = User.from({
    id: '1',
    // name: 1
  })

  t.deepEqual(user, {id: 1})
})
