// Skema Base
///////////////////////////////////////////////////////////
// import {AbstractProcessor} from './processor'
import {IPExpandedTypeDefinition} from './interfaces'
import {Options} from './options'
import {TYPE_SKEMA} from './util'

const UNDEFINED = undefined

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

  isRequired (): Boolean {
    return this._required === true
  }

  // Creates a new Skema based on the current one, but the new one is required
  required (): Skema {
    return this._derive({
      _required: true
    })
  }

  _derive (extra) {
    const options = Object.assign({}, this, extra)
    return new Skema(options)
  }

  _ensureContext () {

  }

  from (raw, args, context): any {

    return this._options.promise.resolve(this.processWhen())
    .then(hit => {
      if (!hit) {
        return
      }

      return Promise.resolve(this.processDefault())
      .then(() => this.processValidator(this.type.validate))
      .then(() => this.processValidator(this.rule.validate))
      .then(() => this.processSetter(this.type.set))
      .then(() => this.processSetter(this.rule.set))
      .then(() => this.processDone())
    })
  }

  hasWhen (): boolean {
    return this._type && this._type.hasWhen()
      || this._when !== undefined
  }

  when (args, context) {

  }

  hasDefault (): boolean {
    return  this._default !== UNDEFINED
  }

  default (args, context) {

  }

  hasValidators (): boolean {

  }

  validate (value, args, context): boolean {

  }

  hasSetters (): boolean {

  }

  set (value, args, context) {

  }

  iterable () {

  }
}
