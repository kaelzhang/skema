import {simpleClone, defineValue} from './util'
import {Processor} from './processor'
import {Context} from './context'
import {error} from './error'
import {SHAPE} from './future'
import {attach} from './inspect'

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

function reducer (prev, factory) {
  return factory.call(this, prev)
}

class Shape {
  constructor (shape, clean) {
    this._shape = shape
    this._clean = clean
  }

  from (args, parentContext: Context, options: Options) {
    if (!isObject(parentContext.input)) {
      const error = parentContext.errorByCode('NOT_OBJECT', parentContext.key)
      return options.promise.reject(error)
    }

    const values = this._create(parentContext)
    const setters = Object.create(null)
    defineValue(values, SHAPE, setters)
    attach(values)

    const tasks = this._taskKeys(parentContext).map(key => () => {
      const [context, skema] = this._task(key, parentContext)
      context.parent = values

      return new Processor({
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

    return options.promiseExtra.series(tasks, reducer)
    .then(() => values)
  }
}

class GenericObjectShape extends Shape {
  _task (key, context) {
    return [context.descend(key), this._shape[key]]
  }
}

export class ObjectShape extends GenericObjectShape {
  _create (context) {
    return this._clean
      ? Object.create(null)
      : simpleClone(context.input)
  }

  _taskKeys () {
    return Object.keys(this._shape)
  }
}

export class ArrayShape extends GenericObjectShape {
  _create ({input}) {
    return this._clean
      ? []
      : [].concat(input)
  }

  _taskKeys () {
    return this._shape
    .map((_, i) => i)
  }
}

class GenericOfShape extends Shape {
  _task (key, context) {
    return [context.descend(key), this._shape]
  }
}

export class ObjectOfShape extends GenericOfShape {
  _create () {
    return Object.create(null)
  }

  _taskKeys ({input}) {
    return Object.keys(input)
  }
}

export class ArrayOfShape extends GenericOfShape {
  _create () {
    return []
  }

  _taskKeys ({input}) {
    const tasks = []
    const {length} = input
    let i = 0

    // Iterate every array item
    for (; i < length; i ++) {
      tasks.push(i)
    }

    return tasks
  }
}
