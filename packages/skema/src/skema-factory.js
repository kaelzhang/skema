// The Factory of Skema according to user preset
///////////////////////////////////////////////////////////
import {Skema} from './skema'
import {Options} from './options'
import {
  UNDEFINED,
  isSkema, isString, isArray, isObject
} from './util'
import {TypeDefinition} from './type'
import {
  ShapeComposable,
  TypeObjectComposable,
  TypeArrayComposable
} from './composable'

const METHODS = [
  'skema',
  'formula',
  'shape',
  'objectOf',
  'arrayOf',
  'any'
]

class Types {
  constructor () {
    this._types = new Map
  }

  get (type) {
    return this._types.get(type)
  }

  register (name, skema, object) {
    this._types.set(name, skema)

    if (object) {
      this._types.set(object, skema)
    }
  }
}

class SkemaFactory {
  constructor (options) {
    METHODS.forEach(method => {
      this[method] = this[method].bind(this)
    })

    const {
      types = {},
      ...others
    } = options

    this._options = new Options(others)
    this._types = new Types

    if (Object(types) !== types) {
      throw 'invalid types'
    }

    Object.keys(types).forEach(name => {
      const {
        type,
        skema
      } = types[name] || {}

      this.type(name, skema, type)
    })
  }

  // The one that has everything inside
  skema (subject): Skema {
    if (isArray(subject)) {
      if (subject.length === 0) {
        throw 'empty array'
      }
      return this.arrayOf(subject[0])
    }

    if (isObject(subject)) {
      return this.shape(subject)
    }

    throw 'invalid argument'
  }

  // Create a single rule
  formula (definition): Skema {
    return parseSkema(definition, this._types)
  }

  // An object taking on a particular shape
  shape (shape: IObjectSkema): Skema {
    return new Skema({
      _composable: new ShapeComposable(parseShape(shape, this._types))
    })
  }

  // An object with property values of a certain type
  objectOf (type): Skema {
    return new Skema({
      _composable: new TypeObjectComposable(parseSkema(type, this._types))
    })
  }

  // An array of a certain type
  arrayOf (type): Skema {
    return new Skema({
      _composable: new TypeArrayComposable(parseSkema(type, this._types))
    })
  }

  // Anything that is ok
  any (): Skema {
    return new Skema(Object.create(null))
  }

  type (name, skema, object = UNDEFINED) {
    name = parseTypeName(name)
    skema = parseSkemaObject(skema)

    this._types.register(name, skema, object)

    return this
  }
}

function parseShape (object, types) {
  const skemaMap = {}
  Object.keys(object).forEach(key => {
    skemaMap[key] = parseSkema(object[key])
  })

  return skemaMap
}

function parseSkema (subject, types) {
  if (isString(subject)) {
    return parseStringSkema(subject, types)
  }

  return parseObjectSkema(subject, types)
}

// {...} -> Skema
function parseObjectSkema (object, types): Skema {
  if (isSkema(object)) {
    return object
  }

  const definition = new TypeDefinition(object)
  if (definition._type) {
    definition._type = parseSkemaType(type, types)
  }

  return new Skema(definition)
}

function getType (name, types) {
  const skema = types.get(name)
  if (!skema) {
    throw 'type not found'
  }

  return skema
}

function parseSkemaType (type, types) {
  if (isSkema(type)) {
    return type
  }

  return getType(type, types)
}

const REGEX_ENDS_QUESTION_MARK = /\?$/

// 'number' -> Skema
function parseStringSkema (string, types): Skema {
  string = string.trim()
  const hasOptionalMark = REGEX_ENDS_QUESTION_MARK.test(string)
  if (hasOptionalMark) {
    // 'number?' -> 'number'
    // 'number ?' -> 'number'
    string = string.slice(0, string.length - 1).trimRight()
  }

  const skema = getType(string, types)

  return hasOptionalMark
    ? skema.isOptional()
      ? skema
      : skema.optional()
    : skema
}

// Trim and validate type name
function parseTypeName (name) {
  name = name.trim()

  if (REGEX_ENDS_QUESTION_MARK.test(name)) {
    throw 'invalid name'
  }

  return name
}

export function factory (options = {}) {
  return new SkemaFactory(options)
}
