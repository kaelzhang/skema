module.exports = class Type {
  constructor (types = {}) {
    this._types = types
  }

  get (type) {
    if (!type) {
      return
    }

    return Type.get(type, this._types)
  }

  register (type, property) {
    this._types[type] = property
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
