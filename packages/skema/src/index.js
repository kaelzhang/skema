export {factory} from './skema-factory'

const {
  skema,
  shape,
  oneOf,
  arrayOf,
  oneOfType,
  objectOf,
  any,
  compose
} = factory()

const defaults = factory

export {
  skema,
  shape,
  oneOf,
  arrayOf,
  oneOfType,
  objectOf,
  any,
  compose,
  defaults
}
