import test from 'ava'

import {shape, any} from '../src'

test('rawParent.b could be changed', async t => {
  const X = shape({
    a: {
      set (a) {
        this.rawParent.b = 2
        return a
      }
    },

    b: any()
  })

  const x = X.from({
    a: 1,
    b: 3
  })

  t.is(x.b, 2)
})
