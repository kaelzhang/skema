// Skema Base
///////////////////////////////////////////////////////////
import {AbstractProcessor} from './processor'
import {IExpandedTypeDefinition} from './interfaces'
import {TypeDefinition} from './type'

export class Skema implements ISkema {
  constructor ({
    type,
    when,
    default: _default
    validate,
    set,
    enumerable,
    configurable,
    writable,
  }: IPExpandedTypeDefinition) {
    this._type = type
    this._when = when
    this._default = _default
    this._validate = validate
  }

  isOptional (): Boolean {

  }

  // Creates a new Skema based on the current one, but the new one is optional
  optional (): Skema {

  }

  isRequired (): Boolean {

  }

  // Creates a new Skema based on the current one, but the new one is required
  required (): Skema {

  }

  from (raw, args, context) {

  }

  hasWhen (): boolean {

  }

  when (args, context) {

  }

  hasDefault (): boolean {

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
