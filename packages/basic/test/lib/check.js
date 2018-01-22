import {defaults} from 'skema'
import test from 'ava'

export function check (types) {
  const {type} = defaults({
    types
  })

  return id => {
    const s = type(id)

    test(`check property: ${id.name || id}`, t => {
      t.is(s.isOptional(), false, 'should not be optional')
    })
  }
}

export const ids = [
  'number',
  Number,
  'string',
  String,
  'date',
  Date,
  'boolean',
  Boolean,
  'regexp',
  RegExp,
  'error',
  Error,
  'symbol',
  Symbol,
  'object',
  Object
]
