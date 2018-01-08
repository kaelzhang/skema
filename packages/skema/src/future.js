function NOOP () {}

const supportsSymbol = typeof Symbol === 'function'

const iterator = supportsSymbol
  ? Symbol.iterator
  : 'TODO'

const mustSupportsSymbol = supportsSymbol
  ? NOOP
  : () => {
    throw 'do not support symbol'
  }

const symbolFor = supportsSymbol
  ? key => Symbol.for(`skema:${key}`)
  : key => `@@symbol.for:skema:${key}`

export {
  iterator,
  mustSupportsSymbol,
  symbolFor
}
