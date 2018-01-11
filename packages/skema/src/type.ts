const {
  defineProperty,
  parseValidators,
  parseSetters,
  parseWhen,
  parseDefault,
  typeSkema
} = require('./util')

const {error} = require('./error')

export class Type {
  constructor (definition) {
    if (typeSkema.is(definition)) {
      return definition
    }

    this._def = new TypeDefinition(definition)
  }

  //
  [iterator] () {
    mustSupportsSymbol()

    throw 'not iterable'
  }

  optional () {
    this._def.default =
  }
}

export class TypeIterable extends Type {
  [iterator] () {
    mustSupportsSymbol()


  }
}

export const TYPE_METHODS = []

export class TypeDefinition {
  constructor (definition) {
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
      type
    } = definition

    this.default = parseDefault(_default)
    this.set = parseSetters(set)
    this.validate = parseValidators(validate)
    this.when = parseWhen(when)
    this.configurable = configurable
    this.enumerable = enumerable
    this.writable = writable
    this.type = type
  }
}
