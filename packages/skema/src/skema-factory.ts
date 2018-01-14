// The Factory of Skema according to user preset
///////////////////////////////////////////////////////////
import {Skema} from './skema'
import {IAsyncOrSyncFunc, IPTypeDefinition, IObjectSkema} from './interfaces'
import {Options} from './options'

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
  skema (): Skema {

  }

  // Create a single rule
  formula (definition: IPTypeDefinition): Skema {

  }

  // An object taking on a particular shape
  shape (object: IObjectSkema): Skema {

  }

  array (array: IPTypeDefinition[]): Skema {

  }

  // Enum
  oneOf (array: any[]): Skema {
    return this.skema({

    })
  }

  // An array of a certain type
  arrayOf (type: IPTypeDefinition): Skema {

  }

  // One of many types
  oneOfType (array: IPTypeDefinition[]): Skema {

  }

  // An object with property values of a certain type
  objectOf (type: IPTypeDefinition[]): Skema {

  }

  // Anything that is ok
  any (): Skema {

  }

  // Compose several types which are all composable and within the same type.
  // The following types are composable:
  // - shape
  // - oneOf
  // - oneOfType
  compose (...types: ITypeDefinition[]): Skema {

  }
}

export function factory (options: object = {}): SkemaFactory {
  return new SkemaFactory(options)
}
