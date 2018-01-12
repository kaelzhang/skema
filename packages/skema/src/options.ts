import FakePromise from 'promise-faker'
import {Skema} from './interfaces'

export class Options {
  promise: Function

  constructor ({
    async: _async = false
  }) {

    this.promise = _async
      ? Promise
      : FakePromise
  }
}
