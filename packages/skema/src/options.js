import FakePromise from 'promise-faker'
import promiseExtra, {factory} from 'promise.extra'

export class Options {
  constructor ({
    // For now, there is only one option
    async: _async = false,
    sequence = false
  }) {
    this.promise = _async
      ? Promise
      : FakePromise

    this.promiseExtra = _async
      ? promiseExtra
      : factory(FakePromise)
  }
}
