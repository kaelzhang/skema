import {STRICT} from '../src'
import {run} from './lib/runner'

const CASES = [
  ['number', Number, 1, 1],
  ['number', Number, '1', 'not a number', true],
  ['string', String, '1', '1'],
  ['string', String, 'a', 'a'],
  ['string', String, 1, 'not a string', true]
]

CASES.forEach(run(STRICT, 'strict'))
