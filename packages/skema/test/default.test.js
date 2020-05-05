import test from 'ava'

import {defaults} from '../src'

const {
  shape,
  any
} = defaults({
  isDefault (rawParent, key) {
    return rawParent[key] === undefined
  }
})

test('change the behavior of isDefault', t => {
  const A = shape({
    a: any()
  })

  t.throws(() => A.from({
    a: undefined
  }), {
    message: 'property \'a\' is not optional'
  })
})
