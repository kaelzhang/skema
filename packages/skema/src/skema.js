// Skema Base
///////////////////////////////////////////////////////////
// import {AbstractProcessor} from './processor'
import {Options} from './options'
import {Context} from './context'
import {
  TYPE_SKEMA, UNDEFINED,
  defineValue, defineValues, getIsKey
} from './util'

export class Skema {
  constructor (options) {
    Object.assign(this, options)
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

  from (raw, args, context): any {
    if (!context) {
      context = new Context(raw)
    }

    
  }
}

defineValues(Skema.prototype, {
  isConfigurable () {
    return this._getConfig('configurable')
  },

  isEnumberable () {
    return this._getConfig('enumerable')
  },

  isWritable () {
    return this._getConfig('writable')
  },

  _getConfig (key) {
    const value = this['_' + key]
    return value !== UNDEFINED
      ? value
      : this._type[getIsKey(key)]()
  },

  isOptional (): Boolean {
    return this._optional === true
  },

  _derive (extra) {
    const options = Object.assign(Object.create(null), this, extra)
    return new Skema(options)
  },

  hasWhen (): boolean {
    return this._type && this._type.hasWhen()
      || this._when !== UNDEFINED
  },

  when (args, context) {

  },

  hasDefault (): boolean {
    return this._default !== UNDEFINED
  },

  default (args, context) {

  },

  hasValidators (): boolean {
    return !!this._validate.length
  },

  // Only test against validators
  _applyValidators (args, context): boolean {

  },

  hasSetters (): boolean {
    return !!this._set.length
  },

  _applySetters (args, context) {

  }
})
