const path = require('path')
const {error} = require('../error')

module.exports = {
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
      value = Number(value)

      if (value !== value) {
        return Promise.reject(error('ERR_NOT_A_NUMBER'))
      }

      return value
    }
  },

  boolean: {
    type: Boolean,
    set: Boolean
  },

  date: {
    type: Date,
    set (value) {
      const date = Date.parse(value)

      if (date !== date) {
        return Promise.reject(error('ERR_NOT_A_DATE', value))
      }

      return new Date(date)
    }
  }
}
