import {
  defaults
} from 'skema'

import {STRICT} from '@skema/basic'

const {
  shape
} = defaults({
  types: STRICT
})

const StrictUser = shape({
  id: Number,
  name: String
})

StrictUser.from({
  id: '123',
  name: 'Steve'
})
// throw Error
// - code: CUSTOM_ERROR
// - message: not a number
// - key: id
