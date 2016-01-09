'use strict'

var types = exports

types.get = get_type


// @param {String} type
// @param {Object} types
function get_type (type, types) {
  if (typeof type === 'string') {
    type = type.toLowerCase()
    var rule = types && types[type] || TYPES[type]

    // type.get('string')
    if (rule) {
      return rule
    }
  }

  var key
  var def

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


var TYPES = types.TYPES = {
  string: {
    type: String,
    set: function(value, is_default) {
      if (is_default) {
        return value || ''
      }

      // Everything could convert to a string, so no checking
      return String(value)
    }
  },

  number: {
    type: Number,
    validate: function(value, is_default) {
      var done = this.async()

      // if not set, then it will be 0
      if (is_default && value === undefined) {
        return done(null, 0)
      }

      if (isNaN(value)) {
        return done(new TypeError('Must be a number.'))
      }

      done(null, 0)
    },
    set: function(value) {
      return Number(value)
    }
  },

  boolean: {
    type: Boolean,
    set: function(value, is_default) {
      if (typeof value === 'boolean') {
        return value
      }

      if (is_default && value === undefined) {
        return false
      }

      if (value === 'null' || value === 'false') {
        return false
      }

      if (!isNaN(value)) {
        return !!(+ value)
      }

      return true
    }
  },

  date: {
    type: Date,
    set: function(value, is_default) {
      if (is_default && value === undefined) {
        return
      }

      // already is
      if (value instanceof Date) {
        return value
      }

      var done = this.async()
      var date = Date.parse(value)
      if (isNaN(date)) {
        done(new TypeError('"' + value + '" is not a valid date.'))

      } else {
        done(null, new Date(value))
      }
    }
  }
}
