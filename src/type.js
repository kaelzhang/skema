const TYPES = {
  string: {
    type: String,
    set (value) {
      // Everything could convert to a string, so no checking
      return String(value) || ''
    }
  },

  number: {
    type: Number,
    set (value) {
      if (isNaN(value)) {
        const error = new TypeError('not a number.')
        return Promise.reject(error)
      }

      return Number(value)
    }
  },

  boolean: {
    type: Boolean,
    set (value) {
      if (typeof value === 'boolean') {
        return value
      }

      if (!value || value === 'null' || value === 'false') {
        return false
      }

      // 0 or other number
      if (!isNaN(value)) {
        return !!(+ value)
      }

      return true
    }
  },

  date: {
    type: Date,
    set (value) {
      const date = Date.parse(value)

      if (isNaN(date)) {
        const error = new TypeError(`"${value}" is not a valid date.`)
        return Promise.reject(error)
      }

      return new Date(date)
    }
  }
}


class Type {
  constructor () {
    this._types = {}
  }

  get (type) {
    return type
      ? Type.get(type, this._types)
      : undefined
  }

  register (type, property) {
    this._types[type] = property
    return this
  }

  // @param {String} type
  // @param {Object} types
  static get = function (type, types) {
    if (typeof type === 'string') {
      type = type.toLowerCase()
      const rule = types && types[type] || TYPES[type]

      // type.get('string')
      if (rule) {
        return rule
      }
    }

    let key
    let def

    // type.get(String)
    for (key in TYPES) {
      def = TYPES[key]

      if (type === def.type) {
        return def
      }
    }

    // type not found
    return
  }
}


module.exports = Type
