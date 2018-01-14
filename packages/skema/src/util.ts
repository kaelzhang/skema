import make_array from 'make-array'
import {error} from './error'
import symbol from 'symbol-for'
import {
  IAsyncOrSyncFunc,
  IPWhen, IWhen,
  IPDefault, IDefault,
  IPValidator, IValidators, IPSingleValidator
  IPSetter, ISetters
} from ''

export const TYPE_SKEMA = symbol.for('skema')
export function isSkema (subject: any): boolean {
  return !!subject && subject[TYPE_SKEMA] === true
}

export function isFunction (subject: any): boolean {
  return typeof subject === 'function'
}

export function isRegExp (subject: any): boolean {
  return !!subject && typeof subject.test === 'function'
}

export function defineProperty (data, key, value, rules = {}): void {
  rules.value = value
  Object.defineProperty(data, key, rules)
}

export function simpleClone (object: object): object {
  return Object.assign(Object.create(null), object)
}

// See "schema design"
export function parseValidator (
  validator: IPSingleValidator
): IAsyncOrSyncFunc {
  if (isFunction(validator)) {
    return validator
  }

  if (isRegExp(validator)) {
    return v => validator.test(v)
  }

  throw error('INVALID_VALIDATOR')
}

export function parseValidators (validators: IPValidator): IValidators {
  if (!validators) {
    return
  }
  return make_array(validators).map(parseValidator)
}

export function parseSetters (setters: IPSetter): ISetters {
  if (!setters) {
    return
  }

  return make_array(setters).map(setter => {
    if (isFunction(setter)) {
      return setter
    }

    throw error('INVALID_SETTER')
  })
}

export function parseWhen (when: IPWhen): IWhen {
  if (isFunction(when)) {
    return when
  }

  if (when === false) {
    return () => false
  }

  // Then true
}

export function parseDefault (_default: IPDefault): IDefault {
  if (_default === undefined) {
    return
  }

  if (isFunction(_default)) {
    return _default
  }

  return () => _default
}
