// Processor to run the flow async or sync
///////////////////////////////////////////////////////////
import {Options} from './options'
import {symbol} from './future'
import {
  PREFIX_IS, getKey, isDefined, defineProperty
} from './util'

const defineHidden = (object, key) =>
  defineProperty(object, key, {
    writable: true
  })

const config = (skema, name) => {
  const value = skema[getKey(name, PREFIX_IS)]()
  return isDefined(value)
    ? value
    : true
}

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
    this.set = null
  }

  mapKey () {
    const {
      skema,
      options,
      context
    } = this

    const key = skema.hasKey()
      ? skema.key(this.args, context, options)
      : context.key

    return options.promise.resolve(key)
  }

  make () {
    const {
      values, skema, args, context, options
    } = this

    const {
      key,
      input
    } = context

    const symbolKey = symbol(key)
    defineHidden(values, symbolKey)

    if (!this._clean) {
      values[symbolKey] = input
    }

    const writable = config(skema, 'writable')

    const set = this.set = this.setters[key] = (
      value,
      // For the first time, we ignore writable
      force,
      // Context
      c,
    ) => {
      if (!c) {
        c = context
      }
      c.input = value

      if (!writable && !force) {
        throw c.errorByCode('NOT_WRITABLE', key)
      }

      const result = skema.f(args, c, options)
      .then(value => {
        return values[symbolKey] = value
      })

      return options.promise.resolve(result, true)
    }

    defineProperty(values, key, {
      set: options.async
        ? () => {
          throw context.errorByCode('ASSIGN_ASYNC')
        }
        : v => set(v),
      get: () => values[symbolKey],
      configurable: config(skema, 'configurable'),
      enumerable: config(skema, 'enumerable')
    })
  }

  process () {
    return this.mapKey()
    .then(key => {
      this.context.key = key
      this.make()

      return this.shouldSkip()
    })
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
