import {
  isNumber,
  isFunction,
  isRegExp,
  isString,
  isError,
  isSymbol
} from 'core-util-is'

export const LOOSE = {
  string: {
    alias: String,
    definition: {
      set (value) {
        // Everything could convert to a string, so no checking
        return value === undefined
          ? ''
          : String(value)
      }
    }
  },

  number: {
    alias: Number,
    definition: {
      set (value) {
        const num = Number(value)

        if (num !== num) {
          throw new TypeError('not a number')
        }

        return num
      }
    }
  },

  boolean: {
    alias: Boolean,
    definition: {
      set: Boolean
    }
  },

  date: {
    alias: Date,
    definition: {
      set (value) {
        if (isNumber(value) && value >= 0) {
          return new Date(value)
        }

        const date = Date.parse(value)

        if (date !== date) {
          throw new TypeError('not a date')
        }

        return new Date(date)
      }
    }
  },

  'function': {
    alias: Function,
    definition: {
      validate (value) {
        if (isFunction(value)) {
          return true
        }

        throw new TypeError('not a function')
      }
    }
  },

  regexp: {
    alias: RegExp,
    definition: {
      set (value) {
        if (isRegExp(value)) {
          return value
        }

        if (isString(value)) {
          return new RegExp(value)
        }

        throw new TypeError('not a regular expression')
      }
    }
  },

  error: {
    alias: Error,
    definition: {
      set (value) {
        if (isError(value)) {
          return value
        }

        return new Error(value)
      }
    }
  },

  object: {
    alias: Object,
    definition: {
      set: Object
    }
  }
}

if (typeof Symbol !== 'undefined') {
  LOOSE.symbol = {
    alias: Symbol,
    definition: {
      set (value) {
        if (isSymbol(value)) {
          return value
        }

        return Symbol(value)
      }
    }
  }
}
