// The Factory of Skema according to user preset
///////////////////////////////////////////////////////////
import {Skema} from './skema'
import {Options} from './options'
import {isArray, isObject} from './util'
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

class SkemaFactory {
  constructor (options) {
    METHODS.forEach(method => {
      this[method] = this[method].bind(this)
    })

    this._options = new Options(options)
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

  }

  // An object taking on a particular shape
  shape (object: IObjectSkema): Skema {

  }

  // An object with property values of a certain type
  objectOf (type): Skema {

  }

  // An array of a certain type
  arrayOf (type): Skema {

  }

  // Anything that is ok
  any (): Skema {
    return new Skema(Object.create(null))
  }
}

function makeSureSkema () {

}

export function factory (options = {}) {
  return new SkemaFactory(options)
}
