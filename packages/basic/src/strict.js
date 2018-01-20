import {
  isString,
  isNumber,
  isDate,
  isSymbol,
  isRegExp,
  isObject,
  isFunction,
  isError,
  isBuffer
} from 'core-util-is'

export const STRICT = {}

function D (name, Ctor, is, message) {
  STRICT[name] = {
    alias: Ctor,
    definition: {
      validate (value) {
        if (is(value)) {
          return true
        }

        throw new TypeError(message)
      }
    }
  }
}

D('string', String, isString, 'not a string')
D('number', Number, isNumber, 'not a number')
D('date', Date, isDate, 'not a date')
D('regexp', RegExp, isRegExp, 'not a regular expression')
D('object', Object, isObject, 'not an object')
D('function', Function, isFunction, 'not a function')
D('error', Error, isError, 'not an error')

typeof Symbol !== undefined && D('symbol', Symbol, isSymbol, 'not a symbol')
