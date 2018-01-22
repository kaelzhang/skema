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

  error (code): Error {
    const error = new Error(code)
    Object.assign(error, this.context)
    return error
  }
}
