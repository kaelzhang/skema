// Skema Base
///////////////////////////////////////////////////////////
// import {AbstractProcessor} from './processor'
import {Context} from './context'
import {
  UNDEFINED,
  isDefined, isArray, isObject,
  defineValue, getKey,
  PREFIX_IS, PREFIX_HAS
} from './util'
import {TYPE_SKEMA} from './future'
import {Options} from './options'

export class Skema {
  constructor (definition) {
    Object.assign(this, definition)
    defineValue(this, TYPE_SKEMA, true)
  }

  from (raw, args, options): any {
    if (!isObject(args) || !isArray(args)) {
      options = args
      args = []
    }

    options = options
      ? new Options(options)
      : this._options

    return options.promise.resolve(
      this.f(args, new Context(raw), options),
      true)
  }

  f (args, context, options): any {
    if (this._any) {
      return options.promise.resolve(context.input)
    }

    return isDefined(this._shape)
      ? this._shape.from(args, context, options)
      : this.validate(args, context, options)
        .then(() => this.set(args, context, options))
  }

  _config (key) {
    const value = this['_' + key]
    return isDefined(value)
      ? value
      : this._type
        ? this._type[getKey(key, PREFIX_IS)]()
        : UNDEFINED
  }

  _hasArray (key) {
    const value = this['_' + key]
    return isDefined(value) && value.length !== 0
  }

  _has (key) {
    return isDefined(this['_' + key])
      || !!this._type && this._type[getKey(key, PREFIX_HAS)]()
  }

  isConfigurable (): Boolean | undefined {
    return this._config('configurable')
  }

  isEnumerable (): Boolean | undefined {
    return this._config('enumerable')
  }

  isWritable (): Boolean | undefined {
    return this._config('writable')
  }

  isOptional (): Boolean | undefined {
    return this._optional === true || (
      this._optional !== false &&
      this._type &&
      this._type.isOptional())
  }

  hasWhen (): boolean {
    return this._has('when')
  }

  when (args, context, options) {
    if (isDefined(this._when)) {
      return options.promise.resolve(
        this._when.apply(context.context, args))
    }

    if (this._type.hasWhen()) {
      return this._type.when(args, context, options)
    }
  }

  hasDefault (): boolean {
    return this._has('default')
  }

  default (args, context, options) {
    if (isDefined(this._default)) {
      return options.promise.resolve(
        this._default.apply(context.context, args))
    }

    if (this._type.hasDefault()) {
      return this._type.default(args, context, options)
    }
  }

  hasKey () {
    return this._has('key')
  }

  key (args, context, options) {
    if (isDefined(this._key)) {
      const {key} = context
      return options.promise.resolve(
        this._key.call(context.context, key, ...args))
    }

    if (this._type.hasKey()) {
      return this._type.key(args, context, options)
    }
  }

  // Only test against validators
  validate (args, context, options): boolean {
    const {promise} = options

    const start = this._type
      ? this._type.validate(args, context, options)
      : promise.resolve(true)

    return start
    .then(pass => {
      if (!pass || !this._hasArray('validate')) {
        return pass
      }

      return options.promiseExtra
      .series.call(context.context, this._validate, function (factory) {
        const {input} = context
        return promise.resolve(factory.call(this, input, ...args))
        .then(pass => {
          if (pass === false) {
            throw context.errorByCode(
              'VALIDATION_FAILS', input, context.context.key)
          }

          return true
        })
      })
      .catch(error => promise.reject(context.makeError(error)))
    })
  }

  set (args, context, options) {
    const {promise} = options

    const start = this._type
      ? this._type.set(args, context, options)
      : promise.resolve(context.input)

    if (!this._hasArray('set')) {
      return start
    }

    return start
    .then(value => {
      return options.promiseExtra
      .waterfall.call(context.context, this._set, value,
        function (prev, factory) {
          return factory.call(this, prev, ...args)
        }
      )
      .catch(error => promise.reject(context.makeError(error)))
    })
  }
}
