const JAVASCRIPT = require('./types/javascript')
const {symbol} = require('./util')
const {error} = require('./error')

const IS_TYPES = symbol('skema:types')
const IS_TYPE = symbol('skema:type')

const isTypes = types => !!(types && types[IS_TYPES])
class Types {
  constructor (types = {}) {
    if (isTypes(types)) {
      return types
    }

    this[IS_TYPES] = true

    this._types = Object.assign(Object.create(null), JAVASCRIPT, types)
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

  register (type, property) {
    this._types[type] = new Type(property)
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

    let key
    let def

    // type.get(String)
    for (key in types) {
      def = types[key]

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
  constructor (type) {
    if (isType(type)) {
      return type
    }

    this[IS_TYPE] = true

    const {
      default: _default = null,
      set = null,
      validate = null
    } = type

    if (!_default && !set && !validate) {
      throw error('INVALID_TYPE')
    }

    this.default = _default
    this.set = set
    this.validate = validate
  }
}

module.exports = {
  isTypes,
  Types,
  isType,
  Type
}
