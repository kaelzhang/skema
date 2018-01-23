import make_array from 'make-array'
import {error} from './error'
import symbol from 'symbol-for'
export const UNDEFINED = void 0
export const PREFIX_IS = 'is'
export const PREFIX_HAS = 'has'

export const TYPE_SKEMA = symbol.for('skema')
export const isSkema = subject => !!subject && subject[TYPE_SKEMA] === true

export const TYPE_ERROR = symbol.for('skema:error')
export const isError = subject => !!subject && subject[TYPE_ERROR]

export const isString = subject => typeof subject === 'string'
export const isFunction = subject => typeof subject === 'function'
export const isRegExp = subject =>
  !!subject && typeof subject.test === 'function'

export const isObject = subject => !!subject && Object(subject) === subject
export const isDefined = subject => subject !== UNDEFINED

export const isArray = Array.isArray

export function defineProperty (object, key, value, rules = {}) {
  rules.value = value
  Object.defineProperty(object, key, rules)
}

export function defineValue (object, key, value) {
  Object.defineProperty(object, key, {value})
}

export function defineValues (object, values) {
  Object.keys(values).forEach(key => defineValue(object, key, values[key]))
}

const hypenate = key => key[0].toUpperCase() + key.slice(1)
export const getKey = (key, prefix) => prefix + hypenate(key)

export function simpleClone (object) {
  return Object.assign(Object.create(null), object)
}

// See "schema design"
export function parseValidator (validator) {
  if (isFunction(validator)) {
    return validator
  }

  if (isRegExp(validator)) {
    return v => validator.test(v)
  }

  throw error('INVALID_VALIDATOR')
}

export function parseValidators (validators) {
  if (!validators) {
    return
  }
  return make_array(validators).map(parseValidator)
}

export function parseSetters (setters) {
  if (!setters) {
    return
  }

  return make_array(setters).map(setter => {
    if (isFunction(setter)) {
      return setter
    }

    throw error('INVALID_SETTER')
  })
}

export function parseWhen (when) {
  if (isFunction(when)) {
    return when
  }

  if (when === false) {
    return () => false
  }

  // Then true
}

export function parseDefault (_default) {
  if (_default === undefined) {
    return
  }

  if (isFunction(_default)) {
    return _default
  }

  return () => _default
}
