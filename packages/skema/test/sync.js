import test from 'ava'
import {factory} from './fixtures/sync-skemas'
import {run} from './lib/runner'

function go (options) {
  factory(options).cases.forEach(run(options))
}

go({
  async: false
})

import {
  shape
} from '../src'

test('from() args', async t => {
  const Type = shape({
    a: {
      set (v, a, b) {
        return v + a + b
      }
    }
  })

  const o = Type.from({a: 1}, [2, 3])
  t.is(o.a, 6)
})
