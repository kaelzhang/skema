// data = {a: {b: 1}}
// 1. value: data, key: null, origin: null, path: []
// 2. descend 'a': value: {b: 1}, key: 'a', origin: data, path: ['a']
// 3. descend 'b': value: 1, key: 'b', origin: {b: 1}, path: ['a', 'b']
export class Context {
  constructor (
    value,
    key = null,
    origin = null,
    path = []
  ) {
    this.value = value
    this.context = {
      origin,
      key,
      path
    }
  }

  descend (key): Context {
    const path = this._context.path.concat(key)
    const origin = this._value
    const value = this._value[key]

    return new Context(value, key, origin, path)
  }

  error (code): Error {
    const error = new Error(code)
    Object.assign(error, this.context)
    return error
  }
}
