import FakePromise from 'promise-faker'
import promiseExtra, {factory} from 'promise.extra'

export class Options {
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
