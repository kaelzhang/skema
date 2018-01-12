// The Factory of Skema according to user preset
///////////////////////////////////////////////////////////
import {Skema, ITypeDefinition} from './skema'
import {IAsyncOrSyncFunc} from './interfaces'
import {Options} from './options'

interface IObjectSkema {
  [propName: string]: ITypeDefinition
}

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
  skema () {

  }

  // An object taking on a particular shape
  shape (object: IObjectSkema): Skema {

  }

  // Enum
  oneOf (array: any[]): Skema {

  }

  // An array of a certain type
  arrayOf (type: ITypeDefinition): Skema {

  }

  // One of many types
  oneOfType (array: ITypeDefinition[]): Skema {

  }

  // An object with property values of a certain type
  objectOf (type: ITypeDefinition[]): Skema {

  }

  // Anything that is ok
  any (): Skema {

  }

  // Compose several types which are all composable and within the same type.
  // The following types are composable:
  // - shape
  // - oneOf
  // - oneOfType
  // - objectOf
  compose (...types: ITypeDefinition[]): Skema {

  }
}

export function factory (options: object = {}): SkemaFactory {
  return new SkemaFactory(options)
}
