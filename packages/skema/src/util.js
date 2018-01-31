import make_array from 'make-array'
import {error} from './error'

const {defineProperty} = Object
export {defineProperty}

export const UNDEFINED = void 0
export const PREFIX_IS = 'is'
export const PREFIX_HAS = 'has'

export const isString = subject => typeof subject === 'string'
export const isFunction = subject => typeof subject === 'function'
export const isRegExp = subject =>
  !!subject && typeof subject.test === 'function'

export const isObject = subject => !!subject && Object(subject) === subject
export const isDefined = subject => subject !== UNDEFINED
export const isArray = Array.isArray

export const defineValue = (object, key, value) =>
  defineProperty(object, key, {value})

const hypenate = key => key[0].toUpperCase() + key.slice(1)
export const getKey = (key, prefix) => prefix + hypenate(key)

export const simpleClone = object => {
  return Object.assign(Object.create(null), object)
}

// See "schema design"
export const parseValidator = validator => {
  if (isFunction(validator)) {
    return validator
  }

  if (isRegExp(validator)) {
    return v => validator.test(v)
  }

  throw error('INVALID_VALIDATOR')
}

export const parseValidators = validators => {
  if (!validators) {
    return
  }
  return make_array(validators).map(parseValidator)
}

export const parseSetters = setters => {
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

export const parseWhen = when => {
  if (isFunction(when)) {
    return when
  }

  if (when === false) {
    return () => false
  }
}

export const parseFunction = subject => {
  if (isFunction(subject)) {
    return subject
  }

  if (isDefined(subject)) {
    return () => subject
  }
}
