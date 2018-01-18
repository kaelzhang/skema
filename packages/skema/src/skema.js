// Skema Base
///////////////////////////////////////////////////////////
// import {AbstractProcessor} from './processor'
import {Options} from './options'
import {Context} from './context'
import {
  TYPE_SKEMA, UNDEFINED,
  defineValue, defineValues, getKey
} from './util'

const PREFIX_IS = 'is'
const PREFIX_HAS = 'has'

export class Skema {
  constructor (definition) {
    Object.assign(this, definition)
    defineValue(this, TYPE_SKEMA, true)
  }

  // Creates a new Skema based on the current one, but the new one is optional
  optional (): Skema {
    return this._derive({
      _optional: true
    })
  }
  // Creates a new Skema based on the current one, but the new one is required
  required (): Skema {
    return this._derive({
      _optional: false,
      _default: UNDEFINED
    })
  }

  enumerable (value?: boolean) {
    return this._derive({
      _enumerable: !!value
    })
  }

  configurable (value?: boolean): Skema {
    return this._derive({
      _configurable: !!value
    })
  }

  writable (value?: boolean) {
    return this._derive({
      _writable: !!value
    })
  }

  from (raw, args = [], context): any {
    if (!context) {
      context = new Context(raw)
    }

    const result = this.validate(args, context)
    .then(() => this.set(args, context))

    return this._options.promise.resolve(result, true)
  }
}

defineValues(Skema.prototype, {
  _getConfig (key) {
    const value = this['_' + key]
    return value !== UNDEFINED
      ? value
      : this._type[getKey(key, PREFIX_IS)]()
  },

  _derive (extra) {
    const options = Object.assign(Object.create(null), this, extra)
    return new Skema(options)
  },

  _has (key) {
    return this._type && this._type[getKey(key, PREFIX_HAS)]()
      || this['_' + key] !== UNDEFINED
  }

  isConfigurable () {
    return this._getConfig('configurable')
  },

  isEnumberable () {
    return this._getConfig('enumerable')
  },

  isWritable () {
    return this._getConfig('writable')
  },

  isOptional (): Boolean {
    return this._optional === true
  },

  hasWhen (): boolean {
    return this._has('when')
  },

  when (args, context) {
    if (this._when !== UNDEFINED) {
      return this._options.promise.resolve(
        this._when.apply(context.context, args))
    }

    if (this._type.hasWhen()) {
      return this._type.when(args, context)
    }
  },

  hasDefault (): boolean {
    return this._has('default')
  },

  default (args, context) {
    if (this._default !== UNDEFINED) {
      return this._options.promise.resolve(
        this._default.apply(context.context, args))
    }

    if (this._type.hasDefault()) {
      return this._type.default(args, context)
    }
  },

  // Only test against validators
  validate (args, context): boolean {
    const {
      value,
      context
    } = context
    const {promise} = this._options

    const start = this._type
      ? this._type.validate(args, context)
      : promise.resolve(true)

    return start
    .then(pass => {
      if (!pass || this._validate === UNDEFINED) {
        return pass
      }

      return this._options.promiseExtra
      .series.call(context, value, ...args)
      .then(
        pass => {
          if (pass === false) {
            throw context.error('validate fail')
          }

          return true
        },

        // Ensure that the context information is attached to the error object
        error => promise.reject(context.error(error))
      )
    })
  },

  set (args, context) {
    const {
      value,
      context
    } = context
    const {promise} = this._options

    const start = this._type && this._type.hasSet()
      ? this._type.set(args, context)
      : promise.resolve(value)

    return start
    .then(value => {
      return this._options.promiseExtra
      .waterfall.call(context, value, ...args)
      .catch(error => promise.reject(context.error(error)))
    })
  }
})
