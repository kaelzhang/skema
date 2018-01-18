export {factory} from './skema-factory'

const {
  skema,
  formula,
  shape,
  arrayOf,
  objectOf,
  any
} = factory()

const defaults = factory

export {
  skema,
  formula,
  shape,
  arrayOf,
  objectOf,
  any
  defaults
}
