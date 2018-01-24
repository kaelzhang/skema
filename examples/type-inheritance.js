// This demo will show you
// how to use and extend a existing type.
import {type} from 'skema'
import {PositiveNumberVerbose} from './multiple-validators'

const PositiveBigNumber = type({
  // Checks the validators of PositiveNumberVerbose first
  type: PositiveNumberVerbose,
  // Then validate against this one
  validate (v) {
    if (v < 10000) {
      throw 'too small'
    }

    return true
  }
})

PositiveBigNumber.from('10000')
// throw Error
// - message: not a number
// the error comes from `PositiveNumberVerbose`

PositiveBigNumber.from(10000)  // 10000
