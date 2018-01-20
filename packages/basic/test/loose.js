import {LOOSE} from '../src'
import {run} from './lib/runner'

const CASES = [
  ['number', Number, 1, 1],
  ['number', Number, '1', 1],
  ['number', Number, 'a', 'not a number', true],
  ['string', String, '1', '1'],
  ['string', String, 1, '1'],
  ['string', String, 'a', 'a'],
  ['string', String, {toString: () => 'foo'}, 'foo']
]

CASES.forEach(run(LOOSE))
