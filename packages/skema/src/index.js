import {LOOSE, STRICT} from '@skema/basic'

import {factory} from './skema-factory'
import {inspect} from './inspect'
import './error-meta'

const {
  type,
  shape,
  arrayOf,
  objectOf,
  any,
  declare
} = factory({
  types: LOOSE
})

const defaults = factory
const BASIC_TYPES = {
  LOOSE,
  STRICT
}

export {
  type,
  shape,
  arrayOf,
  objectOf,
  any,
  declare,
  defaults,
  BASIC_TYPES,
  inspect
}
