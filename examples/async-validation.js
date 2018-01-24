// By default, skema works synchronously.
// To make the validators works asynchronously,
// we should change the default settings

import {defaults} from 'skema'

const {
  type
} = defaults({
  async: true
})

// And then:
// - `validate` could be an async function
// - even sync method `validate` also works asynchronously

// 1
const PositiveNumber = type({
  validate (v) {
    if (typeof v !== 'number') {
      reutrn false
    }

    if (v > 0) {
      return true
    }

    throw 'must be positive'
  }
})

PositiveNumber.from(1)  // Promise{1}
PositiveNumber.from(1).then(console.log)       // prints 1
PositiveNumber.from('1').catch(console.error)  // prints Error

PositiveNumber.from(-1)
// Unhandled Promise rejection

PositiveNumber.from(-1).catch(console.error)
// Error
// - code: 'CUSTOM_ERROR'
// - message: 'must be positive'


// 2
// Real async valdidator
const BigNumber = type({
  validate (v) {
    return new Promise((resolve, reject) => {
      if (typeof v !== 'number') {
        return reject('not a number')
      }

      if (v <= 0) {
        return reject('must be positive')
      }

      if (v < 10000) {
        // resolve `false` also indicates a failure
        return resolve(false)
      }

      resolve(true)
    })
  }
})

const printErrorMessage = err =>
  err && console.error(err.message, err.code)

BigNumber.from(-1).catch(printErrorMessage)
// 'must be positive' 'CUSTOM_ERROR'

BigNumber.from('-1').catch(printErrorMessage)
// 'not a number' 'CUSTOM_ERROR'

BigNumber.from(1).catch(printErrorMessage)
// 'invalid value 1' 'VALIDATION_FAILS'

BigNumber.from(10000).then(console.log)
// 10000


// 3
// Duplex: return value with Promise.reject/resolve
const BigNumber2 = type({
  validate (v) {
    if (typeof v !== 'number') {
      return Promise.reject('not a number')
    }

    if (v <= 0) {
      return Promise.reject('must be positive')
    }

    if (v < 10000) {
      // resolve `false` also indicates a failure
      return Promise.resolve(false)
    }

    return true
  }
})

// The same effect as `BigNumber`
