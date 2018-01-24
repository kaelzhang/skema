import {type} from 'skema'

// 1
const TypeNumber = type({
  // If the return value is
  // - true: pass the validation
  // - false: validation fails
  validate: v => typeof v === 'number'
})

TypeNumber.from(1)    // 1
TypeNumber.from('1')
// Error
// - code: 'VALIDATION_FAILS'
// ...


// 2
// You could just throw an error if something is wrong.
// With this mechanism,
// we could make our error reason verbose if necessary
const PositiveNumber = type({
  validate (v) {
    if (typeof v !== 'number') {
      return false
    }

    if (v > 0) {
      return true
    }

    // If the subject thrown is not an Error,
    // an Error will be created based on the subject
    throw 'must be positive'
  }
})

PositiveNumber.from(1)     // 1
PositiveNumber.from(-1)    // Error thrown
// throw Error
// - code: 'CUSTOM_ERROR'
// - message: 'must be positive'


// 3
// Regular expression as a validator
const Alphabets = type({
  validate: /^[a-z]+$/i
})

Alphabets.from('123')  // Error thrown
