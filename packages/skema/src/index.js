import {factory} from './skema-factory'
import {LOOSE} from '@skema/basic'

const {
  skema,
  formula,
  shape,
  arrayOf,
  objectOf,
  any
} = factory({
  types: LOOSE
})

const defaults = factory

export {
  skema,
  formula,
  shape,
  arrayOf,
  objectOf,
  any,
  defaults
}
