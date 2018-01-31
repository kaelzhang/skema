// Type Definition
///////////////////////////////////////////////////////////
import {
  isDefined,
  parseFunction, parseSetters, parseValidators, parseWhen
} from './util'

export class TypeDefinition {
  constructor (definition: IPTypeDefinition) {
    const {
      default: _default,
      set,
      validate,
      when,
      configurable,
      enumerable,
      writable,
      optional,
      type,
      key
    } = definition

    this._default = parseFunction(_default)
    this._set = parseSetters(set)
    this._validate = parseValidators(validate)
    this._when = parseWhen(when)
    this._key = parseFunction(key)
    this._configurable = configurable
    this._enumerable = enumerable
    this._writable = writable

    // If there is a default value, it IS optional.
    this._optional = isDefined(this._default)
      ? true
      // By default, optional is false
      : optional
    this._type = type
  }
}
