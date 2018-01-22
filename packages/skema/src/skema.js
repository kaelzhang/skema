// Skema Base
///////////////////////////////////////////////////////////
// import {AbstractProcessor} from './processor'
import {Context} from './context'
import {
  TYPE_SKEMA, UNDEFINED,
  isDefined,
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

  from (raw, args = [], context, options): any {
    const noContext = !context

    if (noContext) {
      context = new Context(raw)
    }

    options = options || this._options

    const result = isDefined(this._composable)
      ? this._composable.from(args, context, options)
      : this.validate(args, context, options)
        .then(() => this.set(args, context, options))

    return noContext
      ? this._options.promise.resolve(result, true)
      : result
  }
}

defineValues(Skema.prototype, {
  _getConfig (key) {
    const value = this['_' + key]
    return isDefined(value)
      ? value
      : this._type[getKey(key, PREFIX_IS)]()
  },

  _derive (extra) {
    const options = Object.assign(Object.create(null), this, extra)
    return new Skema(options)
  },

  _hasOwnArray (key) {
    const value = this['_' + key]
    return isDefined(value) && value.length !== 0
  },

  _has (key) {
    if (this._type && this._type[getKey(key, PREFIX_HAS)]()) {
      return true
    }

    return isDefined(this['_' + key])
  },

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

  when (args, context, options) {
    if (isDefined(this._when)) {
      return options.promise.resolve(
        this._when.apply(context.context, args))
    }

    if (this._type.hasWhen()) {
      return this._type.when(args, context, options)
    }
  },

  hasDefault (): boolean {
    return this._has('default')
  },

  default (args, context, options) {
    if (isDefined(this._default)) {
      return options.promise.resolve(
        this._default.apply(context.context, args))
    }

    if (this._type.hasDefault()) {
      return this._type.default(args, context, options)
    }
  },

  // Only test against validators
  validate (args, context, options): boolean {
    const {
      value
    } = context
    const {promise} = options

    const start = this._type
      ? this._type.validate(args, context, options)
      : promise.resolve(true)

    return start
    .then(pass => {
      if (!pass || !this._hasOwnArray('validate')) {
        return pass
      }

      return options.promiseExtra
      .series.call(context.context, this._validate, function (factory) {
        return promise.resolve(factory.call(this, value, ...args))
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
    })
  },

  set (args, context, options) {
    const {
      value
    } = context
    const {promise} = options

    const start = this._type && this._type.hasSet()
      ? this._type.set(args, context, options)
      : promise.resolve(value)

    if (!this._hasOwnArray('set')) {
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
      .catch(error => promise.reject(context.error(error)))
    })
  },

  options (options) {
    this._options = options
  }
})
