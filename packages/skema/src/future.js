// Something that has compatible problem for browsers
// TODO: #6

import {error} from './error'
import {isObject, isString} from './util'
// import symbol from 'symbol-for'

const getTypeName = name => isObject(name)
  ? name.name || name
  : name

// TODO: #6 supports browsers or fallback
export class Types {
  constructor () {
    // Use WeakMap so that it could be GCed
    this._map = new WeakMap
    this._hash = Object.create(null)
  }

  get (name, strict) {
    const value = isObject(name)
      ? this._map.get(name)
      : this._hash[name]

    if (strict && !value) {
      throw error('UNKNOWN_TYPE', getTypeName(name))
    }

    return value
  }

  set (alias, skema) {
    if (isObject(alias)) {
      return this._setMap(alias, skema)
    }

    if (isString(alias)) {
      return this._setHash(alias, skema)
    }
  }

  _setMap (name, skema) {
    if (this._map.has(name)) {
      return this._redefine(name)
    }

    this._map.set(name, skema)
  }

  _redefine (name) {
    throw error('REDECLARE_TYPE', getTypeName(name))
  }

  _setHash (name, skema) {
    if (name in this._hash) {
      return this._redefine(name)
    }

    this._hash[name] = skema
  }
}

// TODO: #6 supports browsers or fallback
export const symbol = Symbol

export const TYPE_SKEMA = symbol.for('skema')
export const isSkema = subject => !!subject && subject[TYPE_SKEMA] === true

export const TYPE_ERROR = symbol.for('skema:error')
export const isError = subject => !!subject && subject[TYPE_ERROR]

export const SHAPE = symbol.for('skema:shape')
export const CUSTOM_INSPECT_SYMBOL = symbol.for('nodejs.util.inspect.custom')
