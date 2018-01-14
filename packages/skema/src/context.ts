import {IContext, IPath, IKey} from './interfaces'

// data = {a: {b: 1}}
// 1. value: data, key: null, origin: null, path: []
// 2. descend 'a': value: {b: 1}, key: 'a', origin: data, path: ['a']
// 3. descend 'b': value: 1, key: 'b', origin: {b: 1}, path: ['a', 'b']
class Context {
  _context: IContext
  _value: any

  constructor (
    value: any,
    key: IKey | null = null,
    origin: any = null,
    path: IPath = []
  ) {
    this._value = value
    this._context = {
      origin,
      key,
      path
    }
  }

  context (): IContext {
    return this._context
  }

  descend (key): Context {
    const path = this._context.path.concat(key)
    const origin = this._value
    const value = this._value[key]

    return new Context(value, key, origin, path)
  }

  error (code): Error {
    return new Error(code)
  }
}
