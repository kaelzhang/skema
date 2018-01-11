import {Skema} from './skema'

class SkemaFactory {
  constructor () {

  }

  create (): Skema {

  }
}

function factory (options) {
  const factory = new SkemaFactory(options)

  function skema (config) {
    return factory.create(config)
  }

  return skema
}

export const skema = factory()

skema.defaults = factory
