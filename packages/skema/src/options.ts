import FakePromise from 'promise-faker'
import promiseExtra from 'promise.extra'

export class Options {
  promise: Function
  promiseExtra: object
  types: object
  clean: boolean

  constructor ({
    async: _async = false,
    types,
    clean = false
  }) {

    this.promise = _async
      ? Promise
      : FakePromise

    this.promiseExtra = _async
      ? promiseExtra
      : factory(FakePromise)

    this.clean = !!clean
  }
}
