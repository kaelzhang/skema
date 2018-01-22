import test from 'ava'
import {defaults} from '../../src'

const getTest = only => only
  ? test.only
  : test

export function run (skemaOptions = {}) {
  const {skema, type} = defaults(skemaOptions)

  return ({
    // description
    d,
    // skema
    s,
    // input value
    input,
    // output value
    output,
    e,
    only
  }, i) => {
    getTest(only)(`${i}: ${d}`, t => {
      const Skema = s

      let o

      try {
        o = Skema.from(input)
      } catch (error) {
        if (!e) {
          console.log('unexpected error:', error.stack || error)
          t.fail('should not fail')
          return
        }
        // TODO
        t.pass()
        // t.is(output, error.message, 'error message not match')
        return
      }

      if (e) {
        t.fail('should fail')
        return
      }

      if (Object(output) === output) {
        t.deepEqual(o, output, 'result not match')
        return
      }

      t.is(o, output, 'result not match')
    })
  }
}
