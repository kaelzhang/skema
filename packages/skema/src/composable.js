import {simpleClone} from './util'
import {Processor} from './processor'

class Composable {
  _type: IComposableType
  constructor (type: IComposableType, rule: any) {
    this._type = type
    this._rule = rule
  }

  from (context, options, args) {

  }
}

const RULES = {
  [SHAPE]: {
    composable: true,
    iterator (rules, args, context, options) { // TODO: check object
      const values = options.clean
        ? Object.create(null)
        : simpleClone(context.value)

      const tasks = Object.keys(rules)
      .map(key => {
        const c = context.descend(key)
        const skema = rules[key]

        return new Processor({
          options,
          skema,
          args,
          context: c,
          values
        })
        .process()
      })

      return options.promise.all(tasks)
    }
  },

  [TYPE_OBJECT]: {
    composable: false,
    iterator (skema, args, context, options) { // TODO: check object
      const values = Object.create(null)

      const tasks = Object.keys(context.value)
      .map(key => {
        const c = context.descend(key)

        return new Processor({
          options,
          skema,
          args,
          context: c,
          values
        })
      })

      return options.promise.all(tasks)
    }
  },

  [TYPE_ARRAY]: {
    composable: false,
    iterator (skema, args, context, options) {  // TODO: check array
      const values = []
      const tasks = context.value.map((v, i) => {
        const c = context.descend(i)

        return new Processor({
          options,
          skema,
          args,
          context: c,
          values
        })
      })

      return options.promise.all(tasks)
    }
  }
}
