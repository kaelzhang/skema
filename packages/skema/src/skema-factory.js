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
  ObjectShape,
  ArrayShape,
  ObjectOfShape,
  ArrayOfShape
} from './shape'

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
    // Use WeakMap so that it could be GCed
    this._map = new WeakMap
    this._hash = Object.create(null)
  }

  get (type) {
    return isObject(type)
      ? this._map.get(type)
      : this._hash[type]
  }

  set (type, skema) {
    isObject(type)
      ? this._setMap(type, skema)
      : this._setHash(type, skema)
  }

  _setMap (name, skema) {
    if (this._map.has(name)) {
      return this._redefine(name)
    }

    this._map.set(name, skema)
  }

  _redefine (name) {
    throw error('REDEFINE_TYPE', getTypeName(name))
  }

  _setHash (name, skema) {
    if (name in this._hash) {
      return this._redefine(name)
    }

    this._hash[name] = skema
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

const validateTypeName = name => isObject(name)
  ? name
  : parseTypeName(name)

// @decorator
function memoize (target, key, descriptor) {
  const original = descriptor.value
  descriptor.value = function (arg) {
    const value = this._types.get(arg)
    if (value !== UNDEFINED) {
      return value
    }

    if (Object.keys(arg).length === 0) {
      throw error('EMPTY_SHAPE')
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

  // StringType: 'number', 'number?', ... -> Skema
  // Skema: User
  // ShapeLeaf: Skema | StringType | Shape
  // IPTypeDefinition: {set () {}, type: Skema | StringType} -> Skema
  // ShapeDef: {a: ShapeLeaf} -> Skema
  //    - ArrayShape: [ShapeLeaf, ...] -> Skema
  //    - special: objectOf -> Skema
  //    - special: arrayOf -> Skema

  skema (subject: ShapeLeaf): Skema {
    return this._skema(subject, true)
  }

  // Create a single type
  type (def: IPTypeDefinition): Skema {
    const definition = new TypeDefinition(def)
    if (definition._type) {
      definition._type = this._skema(definition._type)
    }

    return this._create(definition)
  }

  // An object taking on a particular shape
  @memoize
  shape (shape: ShapeDef): Skema {
    return this._create({
      _shape: isArray(shape)
        ? new ArrayShape(this._arrayShape(shape))
        : new ObjectShape(this._objectShape(shape))
    })
  }

  // `objectOf` and `arrayOf` are two special kinds of shapes.

  // An object with property values of a certain type
  objectOf (type: IPTypeDefinition | Skema): Skema {
    return this._create({
      _shape: new ObjectOfShape(this._skema(type))
    })
  }

  // An array of a certain type
  arrayOf (type): Skema {
    return this._create({
      _shape: new ArrayOfShape(this._skema(type))
    })
  }

  // Anything that is ok
  any (): Skema {
    return new Skema(Object.create(null))
  }

  // Declare a basic type
  declare (name, definition) {
    const names = makeArray(name).map(validateTypeName)
    const skema = isSkema(definition)
      ? this._recreate(definition)
      : this.type(definition)

    names.forEach(name => this._types.set(name, skema))

    return this
  }
}

defineValues(SkemaFactory.prototype, {
  _skema (subject, updateOptions: boolean) {
    if (isSkema(subject)) {
      return updateOptions
        ? this._recreate(subject)
        : subject
    }

    if (isString(subject)) {
      return this._stringType(subject)
    }

    if (isObject(subject)) {
      return this.shape(subject)
    }

    return getType(subject, this._types, true)
  },

  // Make sure the options are the latest given options
  _recreate (skema: Skema): Skema {
    if (skema._options === this._options) {
      return skema
    }

    return skema.options(this._options)
  },

  // 'number' -> Skema
  _stringType (string): Skema {
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
  },

  _arrayShape (array: Array): Skema {
    return array.map(type => this._skema(type))
  },

  _objectShape (shape: Object): Skema {
    const skemaMap = {}
    Object.keys(shape).forEach(key => {
      skemaMap[key] = this._skema(shape[key])
    })

    return skemaMap
  },

  _create (definition: TypeDefinition): Skema {
    definition._options = this._options
    return new Skema(definition)
  }
})

export function factory (options = {}) {
  return new SkemaFactory(options)
}
