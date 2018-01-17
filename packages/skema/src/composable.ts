import {simpleClone} from './util'
import {Processor} from './processor'

const SHAPE = 'SHAPE'
const ARRAY = 'ARRAY'
const TYPE_ARRAY = 'TYPE_ARRAY'

class Composable {
  type: SHAPE | ARRAY | TYPE_ARRAY
  constructor () {

  }

  _iterate () {

  }



  from (context, options, args) {
    return new Processor({
      context,
      options,
      args
    })
  }
}

const ITERATOR = {
  [SHAPE] (rules, args, context, options) {
    const values = options.clean
      ? Object.create(null)
      : simpleClone(raw)

    const tasks = Object.keys(rules)
    .map(key => () => {
      const c = context.descend(key)
      const skema = rules[key]

      return new Processor({
        options,
        skema,
        args,
        context,
        values
      })
      .process()
    })
  }
}
