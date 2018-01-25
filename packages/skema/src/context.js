import {error} from './error'
import {defineValue} from './util'
import {TYPE_ERROR, isError} from './future'

// data = {a: {b: 1}}
// 1. value: data, key: null, parent: null, path: []
// 2. descend 'a': value: {b: 1}, key: 'a', parent: data, path: ['a']
// 3. descend 'b': value: 1, key: 'b', parent: {b: 1}, path: ['a', 'b']
export class Context {
  constructor (
    input,
    key = null,
    parent = null,
    path = []
  ) {
    this.input = input
    this.key = key
    this.rawParent = parent
    this.parent = null
    this.path = path
  }

  get context () {
    const {
      key,
      rawParent,
      parent,
      path,
      input
    } = this

    return {
      key,
      rawParent,
      parent,
      path,
      input
    }
  }

  descend (key): Context {
    return new Context(
      this.input[key], key, this.input, this.path.concat(key))
  }

  _wrap (error) {
    // rawParent and parent will be removed by context later
    error.key = this.key
    error.input = this.input
    error.path = this.path
    defineValue(error, TYPE_ERROR, true)

    return error
  }

  makeError (error) {
    if (isError(error)) {
      return error
    }

    const err = error instanceof Error
      ? error
      : new Error(error)
    err.code = 'CUSTOM_ERROR'

    return this._wrap(err)
  }

  errorByCode (code, ...args): Error {
    const err = error(code, ...args)
    return this._wrap(err)
  }
}
