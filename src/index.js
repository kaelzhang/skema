module.exports = skema

const {
  series,
  waterfall
} = require('promise.extra')

const thenify = require('simple-thenify')

const Type = require('./type')

const {
  merge,
  reject,
  isFunction,
  isRegExp
} = require('./util')


class Skema {
  constructor ({
    rules = {},
    types,
    clean = false,
    parallel = true
  }) {

    this._rules = {}
    this._type = new Type(types)
    this._context = null
    this._clean = clean
    this._parallel = parallel

    let name
    for (name in rules) {
      this.add(name, rules[name])
    }
  }

  context (context) {
    this._context = context
    return this
  }

  add (name, rule) {
    if (!('type' in rule)) {
      return this._add(name, rule, {})
    }

    const type = this._type.get(rule.type)
    if (!type) {
      throw new Error(`unknown type of "${rule.type}" for "${name}".`)
    }

    return this._add(name, rule, type)
  }

  _add (name, rule, type) {
    const cleaned = {}

    // User will override default setter
    const default_setter = 'default' in rule
      ? rule.default
      : type.default

    if (default_setter) {
      cleaned.default = thenify(
        isFunction(default_setter)
          ? default_setter
          : () => default_setter
      )
    }

    const setters = merge(type.set, rule.set, setter => {
      if (!isFunction(setter)) {
        throw new Error(`invalid setter for "${name}".`)
      }

      return thenify(setter)
    })

    if (setters.length) {
      cleaned.set = setters
    }

    const validators = merge(type.validate, rule.validate, validator => {
      validator = parse_validator(validator)
      if (!validator) {
        throw new Error(`invalid validator for "name", only functions and regular expressions are accepted.`)
      }

      return thenify(validator)
    })

    if (validators.length) {
      cleaned.validate = validators
    }

    this._rules[name] = cleaned

    return this
  }

  register (type, property) {
    this._type.register(type, property)
    return this
  }

  parse (data, ...args) {
    const values = this._clean
      ? {}
      : {...data}

    const context = this._context || {...data}
    const tasks = Object.keys(this._rules)
    .map(key => () =>
      this._parse(key, data[key], data, context, args)
      .then(value => {
        values[key] = value
      })
    )

    if (this._parallel) {
      return Promise.all(tasks.map(task => task()))
      .then(() => values)
    }

    return series(tasks).then(() => values)
  }

  _parse (key, value, original, context, args) {
    const rule = this._rules[key]
    const is_default = !(key in original)

    const result = is_default && rule.default
      ? rule.default(...args)
      // Not default value
      : Promise.resolve(value)

    return result
    .then((value) => {
      if (!rule.validate) {
        return value
      }

      return series.call(context, rule.validate, value, ...args)
      .then(
        passes => {
          const pass = passes.every(Boolean)
          if (pass) {
            return value
          }

          return reject(
            `invalid value "${value}" for key "${key}"`, key, value)
        },
        error => reject(error, key, value)
      )
    })
    .then((value) => {
      if (!rule.set) {
        return value
      }

      return waterfall.call(context, rule.set, value, ...args)
      .then(
        value => value,
        error => reject(error, key, value)
      )
    })
  }
}


function skema (options) {
  return new Skema(options)
}

skema.Skema = Skema


// See "schema design"
function parse_validator (validator) {
  return isFunction(validator)
    ? validator
    : isRegExp(validator)
      ? v => validator.test(v)
      : false
}
