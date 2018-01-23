import {factory} from './skema-factory'
import {LOOSE} from '@skema/basic'

const {
  skema,
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
  skema,
  type,
  shape,
  arrayOf,
  objectOf,
  any,
  declare,
  defaults
}
