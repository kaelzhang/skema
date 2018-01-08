module.exports = skema

const {series} = require('promise.extra')
const {Types, Type} = require('./type')
const Processor = require('./processor')
const JS_TYPES = require('./types/javascript')
const {
  simpleClone
} = require('./util')
const {error, i18n} = require('./error')

class Skema {
  constructor ({
    rules = {},
    types,
    clean = false,
    parallel = true
  } = {}) {

    this._rules = Object.create(null)
    // Handles types first, or there will be 'UNKNOWN_TYPE' errors
    this._type = new Types(types)
    this._clean = clean
    this._parallel = parallel

    Object.keys(rules).forEach(name => {
      this.rule(name, rules[name])
    })
  }

  rule (name, rule) {
    if (!('type' in rule)) {
      return this._add(name, rule)
    }

    const type = this._type.get(rule.type)
    if (!type) {
      throw error('UNKNOWN_TYPE', rule.type, name)
    }

    this._add(name, rule, type)
    return this
  }

  _add (name, rule, type) {
    const define = this._rules[name] || (
      this._rules[name] = Object.create(null))

    define.rule = new Type(rule)
    define.type = type || new Type()
  }

  type (type, property) {
    this._type.register(type, property)
    return this
  }

  parse (data, ...args) {
    const values = this._clean
      ? Object.create(null)
      : simpleClone(data)

    const parallel = this._parallel

    const context = simpleClone(data)
    const tasks = Object.keys(this._rules)
    .map(key => () => {
      const {rule, type} = this._rules[key]
      return new Processor({
        key, rule, type, data, context, args, values, parallel
      })
      .process()
    })

    return parallel
      ? Promise.all(tasks.map(task => task())).then(() => values)
      : series(tasks).then(() => values)
  }
}

function skema (options) {
  return new Skema(options)
}

skema.Skema = Skema
skema.Types = Types
skema.Type = Type
skema.i18n = i18n
skema.JS_TYPES = JS_TYPES
