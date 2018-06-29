import {simpleClone, defineValue} from './util'
import {Processor} from './processor'
import {Context} from './context'
import {error} from './error'
import {SHAPE} from './future'

export const TYPE_OBJECT = 'TYPE_OBJECT'
export const TYPE_ARRAY = 'TYPE_ARRAY'

export const set = (object, key, value) => {
  const setters = object[SHAPE]
  const setter = setters && setters[key]
  const context = new Context(
    value,
    key,
    object,
    [key])
  context.parent = object

  if (!setter) {
    throw error('SHAPE_NOT_FOUND')
  }

  return setter(value, false, context)
}

function clean (context) {
  context.rawParent = context.parent = null
}

const isObject = v => Object(v) === v

class Shape {
  constructor (shape, clean) {
    this._shape = shape
    this._clean = clean
  }

  from (args, context: Context, options: Options) {
    if (!isObject(context.input)) {
      const error = context.errorByCode('NOT_OBJECT', context.key)
      return options.promise.reject(error)
    }

    const values = this._create(context)
    const setters = Object.create(null)
    defineValue(values, SHAPE, setters)

    const tasks = this._tasks(context).map(([context, skema]) => {
      context.parent = values
      return () => new Processor({
        options,
        skema,
        args,
        context,
        values,
        setters
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
    return this._shape
    .map((v, i) => [context.descend(i), v])
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
