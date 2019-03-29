import test from 'ava'
import {inspect as nodeInspect} from 'util'
import {run} from './lib/runner'
import {cases} from './fixtures/async-skemas'
import {
  shape,
  inspect
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

test('inspect hierachical', async t => {
  const Type = shape({
    a: Number,
    b: Number,
    c: shape({
      d: Number
    })
  })

  const raw = {
    a: '1',
    b: '2',
    c: {
      d: '3'
    }
  }

  const parsed = {
    a: 1,
    b: 2,
    c: {
      d: 3
    }
  }

  const result = await Type.from(raw, {async: true})
  const inspected = nodeInspect(result)
  t.is(inspected, nodeInspect(parsed))

  t.deepEqual(inspect(result), parsed)
})

test('inspect normal value', t => {
  t.is(inspect(2), 2)
  t.deepEqual(inspect({a: 1}), {a: 1})
})
