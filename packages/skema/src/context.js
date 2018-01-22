import {error} from './error'

// data = {a: {b: 1}}
// 1. value: data, key: null, parent: null, path: []
// 2. descend 'a': value: {b: 1}, key: 'a', parent: data, path: ['a']
// 3. descend 'b': value: 1, key: 'b', parent: {b: 1}, path: ['a', 'b']
export class Context {
  constructor (
    value,
    key = null,
    parent = null,
    path = []
  ) {
    this.value = value
    this.context = {
      parent,
      key,
      path
    }
  }

  descend (key): Context {
    const path = this.context.path.concat(key)
    const parent = this.value
    const value = this.value[key]

    return new Context(value, key, parent, path)
  }

  _wrap (error) {
    Object.assign(error, this.context)
    error.value = this.value

    return error
  }

  makeError (error) {
    const err = error instanceof Error
      ? error
      : new Error(error)
    err.code = 'CUSTOM_ERROR'

    return this._wrap(err)
  }

  errorByCode (code, ...args): Error {
    const err = error(code, ...args)
    err.args = args

    return this._wrap(err)
  }
}
