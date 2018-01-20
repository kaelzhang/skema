import test from 'ava'
import {defaults, skema} from '../src'

test.only('skema', async t => {
  const User = skema({
    id: Number
  })

  const user = User.from({
    id: '1'
  })

  t.deepEqual(user, {id: 1})
})
