// Type Definition
///////////////////////////////////////////////////////////
import {ITypeDefinition} from './interfaces'

export class TypeDefinition implements ITypeDefinition {
  constructor (definition: object) {
    // Empty TypeDefinition is allowed
    if (!definition || Object.keys(definition).length === 0) {
      return
    }

    const {
      default: _default,
      set,
      validate,
      when,
      configurable,
      enumerable,
      writable,
      optional,
      required,
      type
    } = definition

    this.default = parseDefault(_default)
    this.set = parseSetters(set)
    this.validate = parseValidators(validate)
    this.when = parseWhen(when)
    this.configurable = configurable
    this.enumerable = enumerable
    this.writable = writable
    this.optional = optional
    this.required = required
    this.type = type
  }
}
