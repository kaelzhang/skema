module.exports = {
  merge,
  thenify,
  reject
}

const util = require('util')
const make_array = require('make-array')


function thenable (subject) {
  return subject && util.isFunction(subject.then)
}


function thenify (fn) {
  return function (...args) {
    const result = fn.apply(this, args)
    return thenable(result)
      ? result
      : Promise.resolve(result)
  }
}


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
