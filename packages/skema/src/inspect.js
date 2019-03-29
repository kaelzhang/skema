import {CUSTOM_INSPECT_SYMBOL, SHAPE} from './future'
import {defineValue, NOOP, isObject} from './util'

const isNode = typeof process !== 'undefined'
const isSkemaObject = object => !!object[SHAPE]

export const inspect = subject => {
  if (!isObject(subject)) {
    return subject
  }

  if (!isSkemaObject(subject)) {
    return subject
  }

  return inspectSkemaObject(subject)
}

const inspectSkemaObject = object =>
  Object.keys(object[SHAPE]).reduce((ret, key) => {
    ret[key] = inspect(object[key])
    return ret
  }, {})

function inspectSelf () {
  return inspectSkemaObject(this)
}

export const attach = isNode
  ? object => {
    defineValue(object, CUSTOM_INSPECT_SYMBOL, inspectSelf)
  }
  : NOOP
