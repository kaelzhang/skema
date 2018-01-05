const make_array = require('make-array')
const {error} = require('./error')

function isFunction (subject) {
  return typeof subject === 'function'
}

function isRegExp (subject) {
  return !!subject && typeof subject.test === 'function'
}

const symbol = typeof Symbol === 'function'
  ? Symbol.for
  /* istanbul ignore next */
  : x => x

function defineProperty (data, key, value, rules = {}) {
  rules.value = value
  Object.defineProperty(data, key, rules)
}

function simpleClone (object) {
  return Object.assign(Object.create(null), object)
}

// See "schema design"
function parseValidator (validator) {
  if (isFunction(validator)) {
    return validator
  }

  if (isRegExp(validator)) {
    return v => validator.test(v)
  }

  throw error('INVALID_VALIDATOR')
}

function parseValidators (validators) {
  if (!validators) {
    return
  }
  return make_array(validators).map(parseValidator)
}

function parseSetters (setters) {
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

function parseWhen (when) {
  if (isFunction(when)) {
    return when
  }

  if (when === false) {
    return () => false
  }

  // Then true
}

function parseDefault (_default) {
  if (_default === undefined) {
    return
  }

  if (isFunction(_default)) {
    return _default
  }

  return () => _default
}

module.exports = {
  isFunction,
  isRegExp,
  symbol,
  defineProperty,
  simpleClone,
  parseValidators,
  parseSetters,
  parseWhen,
  parseDefault
}
