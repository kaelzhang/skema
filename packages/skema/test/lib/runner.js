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
    // error
    e,
    only,
    // special match: only match values, but do not use deepEqual
    sm
  }, i) => {
    getTest(only)(`${i}: clean:${!!skemaOptions.clean}, ${d}`, async t => {
      await tryCatch(
        () => s.from(input),
        o => {
          if (e) {
            t.fail('should fail')
            return
          }

          typeof output === 'function'
            ? output(t)
            : sm
              ? sMatch(t, o, output)
              : match(t, o, output)
        },
        error => {
          if (!e) {
            console.log('unexpected error:', error.stack || error)
            t.fail('should not fail')
            return
          }

          sMatch(t, error, output, 'error: ')
        }
      )
    })
  }
}

function match (t, value, expect, prefix = '') {
  if (Object(expect) === expect) {
    t.deepEqual(value, expect, `${prefix}result not match`)
    return
  }

  t.is(value, expect, `${prefix}result not match`)
}

function sMatch (t, value, expect, prefix = '') {
  Object.keys(expect).forEach(key => {
    match(t, value[key], expect[key], prefix + key + ': ')
  })
}
