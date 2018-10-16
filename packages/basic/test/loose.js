import {LOOSE} from '../src'
import {run} from './lib/runner'

function foo () {}

const CASES = [
  ['number', Number, 1, 1],
  ['number', Number, '1', 1],
  ['number', Number, 'a', 'not a number', true],
  ['string', String, '1', '1'],
  ['string', String, 1, '1'],
  ['string', String, 'a', 'a'],
  ['string', String, {toString: () => 'foo'}, 'foo'],
  ['date', Date, new Date('2017-01-01'), new Date('2017-01-01')],
  ['date', Date, + new Date('2017-01-01'), new Date('2017-01-01')],
  ['date', Date, '2017-01-01', new Date('2017-01-01')],
  ['date', Date, 'a', 'not a date', true],
  ['boolean', Boolean, 'a', true],
  ['boolean', Boolean, true, true],
  ['boolean', Boolean, 0, false],
  ['function', Function, foo, foo],
  ['function', Function, 'a', 'not a function', true],
  ['regexp', RegExp, 'a', /a/],
  ['regexp', RegExp, /a/, /a/],
  ['regexp', RegExp, 1, 'not a regular expression', true],
  ['error', Error, 'a', new Error('a')],
  ['error', Error, new Error('a'), new Error('a')],
  ['symbol', Symbol, Symbol('a'), Symbol('a')],
  ['symbol', Symbol, 'a', Symbol('a')],
  ['object', Object, 'a', Object('a')],
  ['object', Object, {a: 1}, {a: 1}],
]

CASES.forEach(run(LOOSE, 'loose'))


import {ids, check} from './lib/check'

ids.forEach(check(LOOSE))
