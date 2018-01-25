import {defaults} from '../../src'
import {LOOSE} from '@skema/basic'

const {
  shape,
  type,
  any,
  set
} = defaults({
  async: true,
  types: LOOSE
})

export const cases = []
const only = true

cases.push({
  d: 'async sequence, when context',
  s: () => shape({
    a: {
      set () {
        return 1
      }
    },

    b: {
      when () {
        return this.parent.a > 1
      }
    }
  }, true),
  input: {
    a: 10,
    b: 1
  },
  output: {
    a: 1
  }
})

const ShapeValidateContext = () => shape({
  a: any(),
  b: {
    validate () {
      return this.parent.a > 1
    }
  }
})

cases.push({
  d: 'validate context',
  s: ShapeValidateContext,
  input: {
    a: 1,
    b: 2
  },
  output: {
    code: 'VALIDATION_FAILS'
  },
  e: true
})

cases.push({
  d: 'validate context',
  s: ShapeValidateContext,
  input: {
    a: 2,
    b: 2
  },
  output: {
    a: 2,
    b: 2
  }
})

cases.push({
  d: 'validate context, assignment',
  s: ShapeValidateContext,
  input: {
    a: 2,
    b: 2
  },
  output: {
    a: 2,
    b: 2
  },
  async after (t, o) {
    try {
      o.a = 1
    } catch (e) {
      t.is(e.code, 'ASSIGN_ASYNC', 'after error code not match')

      const value = await set(o, 'a', 1)
      t.is(value, 1)

      try {
        await set(o, 'b', 1)
      } catch (e) {
        t.is(e.code, 'VALIDATION_FAILS', 'after assign error code')
        return
      }
    }

    t.fail('after should fail')
  }
})
