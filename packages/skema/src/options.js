import FakePromise from 'promise-faker'
import {factory, series, waterfall} from 'promise.extra'

const promiseExtra = {
  series,
  waterfall
}

const IS_DEFAULT = (rawParent, key) => !(key in rawParent)

export class Options {
  constructor ({
    // For now, there is only one option
    async = false,
    isDefault = IS_DEFAULT
  }) {
    this.promise = async
      ? Promise
      : FakePromise

    this.promiseExtra = async
      ? promiseExtra
      : factory(FakePromise)

    this.async = async

    this.isDefault = isDefault
  }
}
