import test from 'ava'
import {defaults} from '../../src'

const getTest = only => only
  ? test.only
  : test

const tryCatchSync = (func, success, fail) => {
  let o

  try {
    o = func()
  } catch (error) {
    fail(error)
    return
  }

  success(o)
}

const tryCatchAsync = (func, success, fail) => {
  return func().then(success, fail)
}

const tryCatchFactory = ({async}) => async
  ? tryCatchAsync
  : tryCatchSync

export function run (skemaOptions = {}) {
  const {skema, type} = defaults(skemaOptions)
  const tryCatch = tryCatchFactory(skemaOptions)

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
    getTest(only)(`${i}: clean:${!!skemaOptions.clean}, ${d}`, async t => {
      return tryCatch(
        () => s.from(input),
        o => {
          if (e) {
            t.fail('should fail')
            return
          }

          if (Object(output) === output) {
            t.deepEqual(o, output, 'result not match')
            return
          }

          t.is(o, output, 'result not match')
        },

        e => {
          if (!e) {
            console.log('unexpected error:', error.stack || error)
            t.fail('should not fail')
            return
          }
          // TODO
          t.pass()
          // t.is(output, error.message, 'error message not match')
        }
      )
    })
  }
}
