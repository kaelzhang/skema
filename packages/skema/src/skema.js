// Skema Base
///////////////////////////////////////////////////////////
// import {AbstractProcessor} from './processor'
import {IPExpandedTypeDefinition} from './interfaces'
import {Options} from './options'
import {TYPE_SKEMA, UNDEFINED} from './util'

type GetterOrFactory = Skema | boolean

export class Skema implements ISkema {
  [TYPE_SKEMA]: boolean

  constructor (options: ISkema) {
    Object.assign(this, options)
    this[TYPE_SKEMA] = true
  }

  isOptional (): Boolean {
    return this._optional === true
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

  _getConfig (key) {
    const value = this['_' + key]
    return value !== UNDEFINED
      ? value
      : this._type[key]()
  }

  enumerable (value?: boolean): GetterOrFactory {
    if (value === UNDEFINED) {
      return this._getConfig('enumerable')
    }

    return this._derive({
      _enumerable: !!value
    })
  }

  configurable (value?: boolean): GetterOrFactory {
    if (value === UNDEFINED) {
      return this._getConfig('configurable')
    }

    return this._derive({
      _configurable: !!value
    })
  }

  writable (value?: boolean) {
    if (value === UNDEFINED) {
      return this._getConfig('writable')
    }

    return this._derive({
      _writable: !!value
    })
  }

  _derive (extra) {
    const options = Object.assign({}, this, extra)
    return new Skema(options)
  }

  _ensureContext () {

  }

  from (raw, args, context): any {
    if (true) {

    }
  }

  hasWhen (): boolean {
    return this._type && this._type.hasWhen()
      || this._when !== UNDEFINED
  }

  when (args, context) {

  }

  hasDefault (): boolean {
    return this._default !== UNDEFINED
  }

  default (args, context) {

  }

  hasValidators (): boolean {
    return !!this._validate.length
  }

  // Only test against validators
  test (value, args, context): boolean {

  }

  hasSetters (): boolean {
    return !!this._set.length
  }

  set (value, args, context) {

  }
}
