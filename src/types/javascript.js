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
      if (isNaN(value)) {
        const error = new TypeError('not a number.')
        return Promise.reject(error)
      }

      return Number(value)
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

      if (isNaN(date)) {
        const error = new TypeError(`"${value}" is not a valid date.`)
        return Promise.reject(error)
      }

      return new Date(date)
    }
  }
}
