import make_array from 'make-array'
import {error} from './error'
import instanceOf from 'graceful-instanceof'

export const typeSkema = instanceOf('skema')

export function isFunction (subject) {
  return typeof subject === 'function'
}

export function isRegExp (subject) {
  return !!subject && typeof subject.test === 'function'
}

export function defineProperty (data, key, value, rules = {}) {
  rules.value = value
  Object.defineProperty(data, key, rules)
}

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
