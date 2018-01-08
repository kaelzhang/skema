const {
  defineProperty,
  parseValidators,
  parseSetters,
  parseWhen,
  parseDefault
} = require('./util')

import {
  iterator,
  mustSupportsSymbol
} from './future'

import {
  IS_TYPE
} from './constants'

const {error} = require('./error')

const isType = type => !!(type && type[IS_TYPE])

export class Type {
  constructor (definition) {
    if (isType(definition)) {
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
