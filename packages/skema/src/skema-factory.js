// The Factory of Skema according to user preset
///////////////////////////////////////////////////////////
import {Skema} from './skema'
import {Options} from './options'
import makeArray from 'make-array'
import {error} from './error'
import {
  UNDEFINED,
  isSkema, isString, isArray, isObject,
  defineValues
} from './util'
import {TypeDefinition} from './type'
import {
  ShapeComposable,
  TypeObjectComposable,
  TypeArrayComposable
} from './composable'

const METHODS = [
  'skema',
  'type',
  'shape',
  'objectOf',
  'arrayOf',
  'any',
  'declare'
]

const getTypeName = name => isObject(name)
  ? name.name || name
  : name

class Types {
  constructor () {
    this._types = new Map
  }

  get (type) {
    return this._types.get(type)
  }

  set (name, skema) {
    if (this._types.has(name)) {
      throw error('REDEFINE_TYPE', getTypeName(name))
    }

    this._types.set(name, skema)
  }

  register (name, skema, alias) {
    this.set(name, skema)

    alias.forEach(name => {
      this.set(name, skema)
    })
  }
}

function getType (name, types, thrown) {
  const skema = types.get(name)
  if (thrown && !skema) {
    throw error('UNKNOWN_TYPE', getTypeName(name))
  }

  return skema
}

const REGEX_ENDS_QUESTION_MARK = /\?$/

// Trim and validate type name
function parseTypeName (name) {
  if (!isString(name)
    || REGEX_ENDS_QUESTION_MARK.test(name = name.trim())
  ) {
    throw error('INVALID_TYPE_NAME', name)
  }

  return name
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
      throw error('NON_OBJECT_TYPES')
    }

    Object.keys(types).forEach(name => {
      const {
        alias,
        definition
      } = types[name] || {}

      this.declare(name, definition, ...makeArray(alias))
    })
  }

  // The one that has everything inside
  skema (subject): Skema {
    if (isSkema(subject)) {
      return this._recreate(subject)
    }

    if (isArray(subject)) {
      if (subject.length === 0) {
        throw 'empty array'
      }
      return this.arrayOf(subject[0])
    }

    if (isObject(subject)) {
      return this.shape(subject)
    }

    throw error('INVALID_SKEMA')
  }

  // Create a single type
  type (definition): Skema {
    return this._parseSkema(definition)
  }

  // An object taking on a particular shape
  shape (shape: IObjectSkema): Skema {
    return this._create({
      _composable: new ShapeComposable(this._parseShape(shape))
    })
  }

  // An object with property values of a certain type
  objectOf (type): Skema {
    return this._create({
      _composable: new TypeObjectComposable(this._parseSkema(type))
    })
  }

  // An array of a certain type
  arrayOf (type): Skema {
    return this._create({
      _composable: new TypeArrayComposable(this._parseSkema(type, this._types))
    })
  }

  // Anything that is ok
  any (): Skema {
    return new Skema(Object.create(null))
  }

  // Declare a basic type
  declare (name, definition, ...alias) {
    name = parseTypeName(name)
    const skema = this._parseObjectSkema(definition, true)

    this._types.register(name, skema, alias)

    return this
  }
}

defineValues(SkemaFactory.prototype, {
  _recreate (skema) {
    if (skema._options === this._options) {
      return skema
    }

    return skema.options(this._options)
  },

  _create (definition) {
    definition._options = this._options
    return new Skema(definition)
  },

  _parseShape (shape) {
    const skemaMap = {}
    Object.keys(shape).forEach(key => {
      skemaMap[key] = this._parseSkema(shape[key])
    })

    return skemaMap
  },

  _parseSkema (subject) {
    if (isString(subject)) {
      return this._parseStringSkema(subject)
    }

    return this._parseObjectSkema(subject)
  },

  // {...} -> Skema
  _parseObjectSkema (object, noSearchTypes): Skema {
    if (isSkema(object)) {
      return object
    }

    if (!noSearchTypes) {
      const skema = getType(object, this._types)
      if (skema) {
        return skema
      }
    }

    const definition = new TypeDefinition(object)
    if (definition._type) {
      definition._type = this._parseSkemaType(definition._type)
    }

    return this._create(definition)
  },

  _parseSkemaType (type) {
    if (isSkema(type)) {
      return type
    }

    return getType(type, this._types, true)
  },

  // 'number' -> Skema
  _parseStringSkema (string): Skema {
    string = string.trim()
    const hasOptionalMark = REGEX_ENDS_QUESTION_MARK.test(string)
    if (hasOptionalMark) {
      // 'number?' -> 'number'
      // 'number ?' -> 'number'
      string = string.slice(0, string.length - 1).trimRight()
    }

    const skema = getType(string, this._types, true)

    return hasOptionalMark
      ? skema.isOptional()
        ? skema
        : skema.optional()
      : skema
  }
})

export function factory (options = {}) {
  return new SkemaFactory(options)
}
