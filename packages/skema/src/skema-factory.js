// The Factory of Skema according to user preset
///////////////////////////////////////////////////////////
import {Skema} from './skema'
import {Types} from './future'
import {Options} from './options'
import makeArray from 'make-array'
import {error} from './error'
import {
  isString, isArray, isObject, isDefined
} from './util'
import {isSkema} from './future'
import {TypeDefinition} from './type'
import {
  ObjectShape,
  ArrayShape,
  ObjectOfShape,
  ArrayOfShape,
  set
} from './shape'

const METHODS = [
  'type',
  'shape',
  'objectOf',
  'arrayOf',
  'any',
  'declare'
]

const REGEX_ENDS_QUESTION_MARK = /\?$/
// Trim and validate type name
const parseTypeName = name => {
  if (!isString(name)
    || REGEX_ENDS_QUESTION_MARK.test(name = name.trim())
  ) {
    throw error('INVALID_TYPE_NAME', name)
  }

  return name
}

const validateTypeName = name => isObject(name)
  ? name
  : parseTypeName(name)

// @decorator
const memoize = (target, key, descriptor) => {
  const original = descriptor.value
  descriptor.value = function (arg) {
    const value = this._types.get(arg)
    if (isDefined(value)) {
      return value
    }

    if (Object.keys(arg).length === 0) {
      throw error('EMPTY_TYPE')
    }

    const created = original.call(this, arg)
    this._types.set(arg, created)
    return created
  }

  return descriptor
}

class SkemaFactory {
  constructor (options) {
    METHODS.forEach(method => {
      this[method] = this[method].bind(this)
    })

    const {
      types = [],
      ...others
    } = options

    this._options = new Options(others)
    this._types = new Types

    if (!isArray(types)) {
      throw error('NON_ARRAY_TYPES')
    }

    types.forEach(({name, definition}) => {
      this.declare(name, definition)
    })
  }

  set (...args) {
    return set(...args)
  }

  // IPTypeDefinition: {set () {}, type: Skema | StringType} -> Skema
  // SkemaAlias: string | object
  // TypeDef: SkemaAlias | IPTypeDefinition | Skema
  // ShapeDef: {[string]: TypeDef} -> Skema
  //    - ArrayShape: TypeDef[TypeDef] -> Skema
  //    - special: objectOf(TypeDef) -> Skema
  //    - special: arrayOf(TypeDef) -> Skema

  // Create a single type
  type (def: TypeDef): Skema {
    if (isSkema(def)) {
      return def
    }

    if (isString(def)) {
      return this._stringType(def)
    }

    if (isObject(def)) {
      return this._type(def)
    }

    throw error('INVALID_TYPE')
  }

  @memoize
  _type (def: TypeDef): Skema {
    const definition = new TypeDefinition(def)
    if (definition._type) {
      definition._type = this.type(definition._type)
    }

    return this._create(definition)
  }

  shape (shape: ShapeDef, clean: boolean): Skema {
    return this._create({
      _shape: isArray(shape)
        ? new ArrayShape(this._arrayShape(shape), clean)
        : new ObjectShape(this._objectShape(shape), clean)
    })
  }

  // `objectOf` and `arrayOf` are two special kinds of shapes.

  // An object with property values of a certain type
  objectOf (type: TypeDef): Skema {
    return this._create({
      _shape: new ObjectOfShape(this.type(type))
    })
  }

  // An array of a certain type
  arrayOf (type: TypeDef): Skema {
    return this._create({
      _shape: new ArrayOfShape(this.type(type))
    })
  }

  // Anything that is ok
  any (): Skema {
    return this._create({
      _any: true
    })
  }

  // Declare a basic type
  declare (name, definition) {
    const names = makeArray(name).map(validateTypeName)
    const skema = this.type(definition)

    names.forEach(name => this._types.set(name, skema))
  }

  // 'number' -> Skema
  _stringType (string): Skema {
    string = string.trim()
    const hasOptionalMark = REGEX_ENDS_QUESTION_MARK.test(string)
    if (hasOptionalMark) {
      // 'number?' -> 'number'
      // 'number ?' -> 'number'
      string = string.slice(0, string.length - 1).trimRight()
    }

    const skema = this._types.get(string, true)

    return hasOptionalMark
      ? skema.isOptional()
        ? skema
        : this.type({
          type: skema,
          optional: true
        })
      : skema
  }

  _arrayShape (array: Array): Skema {
    return array.map(type => this.type(type))
  }

  _objectShape (shape: Object): Skema {
    const skemaMap = {}
    Object.keys(shape).forEach(key => {
      skemaMap[key] = this.type(shape[key])
    })

    return skemaMap
  }

  _create (definition: TypeDefinition): Skema {
    definition._options = this._options
    return new Skema(definition)
  }
}

export const factory = (options = {}) => new SkemaFactory(options)
