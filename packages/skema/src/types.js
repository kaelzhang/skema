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
