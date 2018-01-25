import {factory} from './skema-factory'
import {LOOSE} from '@skema/basic'

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

export {
  type,
  shape,
  arrayOf,
  objectOf,
  any,
  declare,
  defaults
}
