// Processor to run the flow async or sync
///////////////////////////////////////////////////////////
import {Options} from './options'

export class Processor {
  constructor (options) {
    Object.assign(this, options)

    const {
      key,
      rawParent,
      input
    } = this.context
    this.isDefault = !(key in rawParent)
    this.input = input
  }

  process () {
    return this.options.promise.resolve()
    .then(() => this.shouldSkip())
    .then(skip => {
      if (skip) {
        return
      }

      return this.set(this.input, true)
    })
  }

  // Returns whether we should skip checking
  shouldSkip () {
    const {skema} = this

    if (!skema.hasWhen()) {
      return this._shouldSkip()
    }

    return skema.when(
      this.args, this.context, this.options)
    .then(hit => {
      if (!hit) {
        // Skip
        return true
      }

      return this._shouldSkip()
    })
  }

  _shouldSkip () {
    const {skema} = this

    // has the key
    if (!this.isDefault) {
      // not skip
      return false
    }

    // If the key is required,
    // optional and default are mutual exclusive,
    // so we simply check optional first.
    if (!skema.isOptional()) {
      throw this.context.errorByCode(
        'NOT_OPTIONAL', this.context.key)
    }

    if (!skema.hasDefault()) {
      // skip
      return true
    }

    return skema.default(
      this.args, this.context, this.options)
    .then(value => {
      this.input = value
      return false
    })
  }
}
