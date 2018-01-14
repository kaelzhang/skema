import FakePromise from 'promise-faker'
import promiseExtra from 'promise.extra'

export class Options {
  promise: Function
  promiseExtra: object
  types: object

  constructor ({
    async: _async = false,
    types
  }) {

    this.promise = _async
      ? Promise
      : FakePromise

    this.promiseExtra = _async
      ? promiseExtra
      : factory(FakePromise)
  }
}
