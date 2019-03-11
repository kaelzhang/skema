import FakePromise from 'promise-faker'
import {factory, series, waterfall} from 'promise.extra'

const promiseExtra = {
  series,
  waterfall
}

export class Options {
  constructor ({
    // For now, there is only one option
    async = false
  }) {
    this.promise = async
      ? Promise
      : FakePromise

    this.promiseExtra = async
      ? promiseExtra
      : factory(FakePromise)

    this.async = async
  }
}
