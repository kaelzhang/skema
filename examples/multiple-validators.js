// We could also define multiple validators,
// so that the code slices are more reusable

// Let's refractor the `PositiveNumber` with multiple validators

import {type} from 'skema'

// 1

// So that `isNumber` and `isPositive`
// could be used by other modules
export const isNumber = n => typeof n === 'number'
export const isPositive = n => n > 0

export const PositiveNumber = type({
  // The property validate could also be an array of validators.
  // The given value will be tested against the validator
  // one by one.
  // If passed the first validator,
  // and it will be tested against the second one, and so on.
  // Otherwise, the validation stops and throws
  validate: [isNumber, isPositive]
})

PositiveNumber.from('1')  // Error thrown
PositiveNumber.from(-1)   // Error thrown


// 2
export const isNumberThrown = n => {
  if (typeof n !== 'number') {
    throw 'not a number'
  }

  return true
}

export const isPositiveThrown = n => {
  if (n <= 0) {
    throw 'must be positive'
  }

  return true
}

export const PositiveNumberVerbose = type({
  validate: [isNumberThrown, isPositiveThrown]
})
