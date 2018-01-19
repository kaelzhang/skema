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

function D (name, Ctor, validate) {
  STRICT[name] = {
    alias: Ctor,
    definition: {
      validate
    }
  }
}

D('string', String, isString)
D('number', Number, isNumber)
D('date', Date, isDate)
D('regexp', RegExp, isRegExp)
D('object', Object, isObject)
D('function', Function, isFunction)
D('error', Error, isError)

typeof Symbol !== undefined && D('symbol', Symbol, isSymbol)
