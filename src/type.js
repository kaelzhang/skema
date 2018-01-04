const {
  symbol,
  defineProperty,
  parseValidators,
  parseSetters,
  parseWhen,
  parseDefault
} = require('./util')
const {error} = require('./error')

const IS_TYPES = symbol('skema:types')
const IS_TYPE = symbol('skema:type')

const isTypes = types => !!(types && types[IS_TYPES])
class Types {
  constructor (types = {}) {
    if (isTypes(types)) {
      return types
    }
    defineProperty(this, IS_TYPES, true)

    this._types = Object.create(null)

    Object.keys(types).forEach(name => {
      this.register(name, types[name])
    })
  }

  get (type) {
    if (!type) {
      return
    }

    if (isType(type)) {
      return type
    }

    return Types.get(type, this._types)
  }

  register (name, type) {
    this._types[name] = new Type(type)
  }

  // @param {String} type
  // @param {Object} types
  static get = function (type, types) {
    if (typeof type === 'string') {
      type = type.toLowerCase()
      const rule = types && types[type]

      // type.get('string')
      if (rule) {
        return rule
      }
    }

    // type.get(String)
    for (const key in types) {
      const def = types[key]

      if (type === def.type) {
        return def
      }
    }

    // type not found
    return
  }
}

const isType = type => !!(type && type[IS_TYPE])
const Type = class Type {
  constructor (definition) {
    if (!definition) {
      throw error('INVALID_TYPE')
    }

    if (isType(definition)) {
      return definition
    }
    defineProperty(this, IS_TYPE, true)

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

module.exports = {
  isTypes,
  Types,
  isType,
  Type
}
