import FakePromise from 'promise-faker'
import {factory, series, waterfall} from 'promise.extra'

const promiseExtra = {
  series,
  waterfall
}

export class Options {
  constructor ({
    // For now, there is only one option
    async: _async = false
  }) {
    this.promise = _async
      ? Promise
      : FakePromise

    this.promiseExtra = _async
      ? promiseExtra
      : factory(FakePromise)

    this.async = _async
  }
}
