import {
  PREFIX_IS,
  getKey, simpleClone, isDefined,
  defineValue, defineProperty
} from './util'
import {Processor} from './processor'
import {SHAPE, symbol} from './future'
import {Context} from './context'
import {error} from './error'

export const TYPE_OBJECT = 'TYPE_OBJECT'
export const TYPE_ARRAY = 'TYPE_ARRAY'

const defineHidden = (object, key) =>
  defineProperty(object, key, {
    writable: true
  })

const config = (skema, name) => {
  const value = skema[getKey(name, PREFIX_IS)]()
  return isDefined(value)
    ? value
    : true
}

export const set = (object, key, value) => {
  const setters = object[SHAPE]
  const setter = setters && setters[key]
  const context = new Context(
    value,
    object,
    key,
    [key])

  if (!setter) {
    throw error('SHAPE_NOT_FOUND')
  }

  return setter(value, false, context)
}

function clean (context) {
  context.rawParent = null
  context.parent = null
}

class Shape {
  constructor (shape, clean) {
    this._shape = shape
    this._clean = clean
    this._setters = Object.create(null)
  }

  from (args, context: Context, options: Options) {
    const values = this._create(context)
    defineValue(values, SHAPE, this._setters)

    const tasks = this._tasks(context).map(([context, skema]) => {
      context.parent = values
      const set = this.make(values, skema, args, context, options)
      return () => new Processor({
        options,
        skema,
        args,
        context,
        set
      })
      .process()
      .then(
        () => clean(context),
        error => {
          clean(context)
          return options.promise.reject(error)
        }
      )
    })

    return options.promiseExtra.series(tasks)
    .then(() => values)
  }

  make (values, skema, args, context, options) {
    const {
      key,
      input
    } = context

    const symbolKey = symbol(key)
    defineHidden(values, symbolKey)

    if (!this._clean) {
      values[symbolKey] = input
    }

    const writable = config(skema, 'writable')

    const set = this._setters[key] = (
      value,
      // For the first time, we ignore writable
      force,
      // Context
      c,
    ) => {
      if (!c) {
        c = context
      }
      c.input = value

      if (!writable && !force) {
        throw c.errorByCode('NOT_WRITABLE', key)
      }

      const result = skema.f(args, c, options)
      .then(value => {
        return values[symbolKey] = value
      })

      return options.promise.resolve(result, true)
    }

    defineProperty(values, key, {
      set: v => set(v),
      get: () => values[symbolKey],
      configurable: config(skema, 'configurable'),
      enumerable: config(skema, 'enumerable')
    })

    return set
  }
}

export class ObjectShape extends Shape {
  _create (context) {
    return this._clean
      ? Object.create(null)
      : simpleClone(context.input)
  }

  _tasks (context) {
    const shape = this._shape
    return Object.keys(shape)
    .map(key => [context.descend(key), shape[key]])
  }
}

export class ArrayShape extends Shape {
  _create (context) {
    return this._clean
      ? []
      : [].concat(context.input)
  }

  _tasks (context) {
    return this._shape.map((v, i) => [context.descend(i), v])
  }
}

export class ObjectOfShape extends Shape {
  _create () {
    return Object.create(null)
  }

  _tasks (context) {
    return Object.keys(context.input)
    .map(key => [context.descend(key), this._shape])
  }
}

export class ArrayOfShape extends Shape {
  _create () {
    return []
  }

  _tasks (context) {
    const tasks = []
    const {input} = context
    const {length} = input
    let i = 0

    // Iterate every array item
    for (; i < length; i ++) {
      tasks.push([context.descend(i), this._shape])
    }

    return tasks
  }
}
