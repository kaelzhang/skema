import test from 'ava'
import {run} from './lib/runner'
import {cases} from './fixtures/async-skemas'
import {
  shape
} from '../src'

cases.forEach(run({
  async: true
}))

test('from() options', async t => {
  const Type = shape({
    a: Number,
    b: Number
  })

  return Type.from({a: '1', b: '2'}, {async: true})
  .then(result => {
    t.is(result.a, 1)
    t.is(result.b, 2)
  })
})
