// The Factory of Skema according to user preset
///////////////////////////////////////////////////////////
import {Skema} from './skema'
import {IAsyncOrSyncFunc, IPTypeDefinition, IObjectSkema} from './interfaces'
import {Options} from './options'
import {isArray, isObject} from './util'

const METHODS = [
  'shape',
  'oneOf',
  'arrayOf',
  'oneOfType',
  'objectOf',
  'any',
  'compose'
]

class SkemaFactory {
  _options: Options

  constructor (options: object) {
    METHODS.forEach(method => {
      this[method] = this[method].bind(this)
    })

    this._options = new Options(options)
  }

  // The one that has everything inside
  skema (subject: any): Skema {
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
  formula (definition: IPTypeDefinition): Skema {

  }

  // An object taking on a particular shape
  shape (object: IObjectSkema): Skema {

  }

  // An object with property values of a certain type
  objectOf (type: IPTypeDefinition[]): Skema {

  }

  // An array of a certain type
  arrayOf (type: IPTypeDefinition): Skema {

  }

  // Anything that is ok
  any (): Skema {

  }

  // Compose several types which are all composable and within the same type.
  // The following types are composable:
  // - shape
  compose (...types: ITypeDefinition[]): Skema {

  }
}

export function factory (options: object = {}): SkemaFactory {
  return new SkemaFactory(options)
}
