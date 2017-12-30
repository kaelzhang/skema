const {
  isFunction,
  isRegExp
} = require('util')

const make_array = require('make-array')

function merge (a, b, mapper) {
  const receiver = b
    ? make_array(a).concat(b)
    : make_array(a)

  return receiver.map(mapper)
}

function reject (message, key, value) {
  const error = message instanceof Error
    ? message
    : new Error(message)

  error.key = key
  error.value = value
  return Promise.reject(error)
}

module.exports = {
  merge,
  reject,
  isFunction,
  isRegExp
}
