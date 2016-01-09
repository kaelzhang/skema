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


// Default types should support both sync and async validators and setters
var TYPES = types.TYPES = {
  string: {
    type: String,
    set: function(value) {
      // Everything could convert to a string, so no checking
      return String(value) || ''
    }
  },

  number: {
    type: Number,
    validate: function(value) {
      if (isNaN(value)) {
        return new TypeError('Must be a number.')
      }

      return true
    },
    set: function(value) {
      return Number(value)
    }
  },

  boolean: {
    type: Boolean,
    set: function(value) {
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
    validate: function (value) {
      var date = Date.parse(value)
      if (isNaN(date)) {
        return new TypeError('"' + value + '" is not a valid date.')
      }

      return true
    },
    set: function(value) {
      return new Date(value)
    }
  }
}
