module.exports = skema

const Type = require('./type')
const util = require('util')
const {
  merge,
  thenify,
  reject
} = require('./util')
const {
  series,
  waterfall
} = require('promise.extra')


class Skema {
  constructor ({
    rules = {},
    types = {},
    clean = false
  }) {

    this._rules = {}
    this._type = new Type()
    this._context = {}
    this._clean = clean

    let type
    for (type in types) {
      this.register(type, types[type])
    }

    let name
    for (name in rules) {
      this.add(name, rules[name])
    }
  }

  add (name, rule) {
    const type = this._type.get(rule.type) || {}
    const cleaned = {}

    // User will override default setter
    const default_setter = 'default' in rule
      ? rule.default
      : type.default

    if (default_setter) {
      cleaned.default = thenify(
        util.isFunction(default_setter)
          ? default_setter
          : () => default_setter
      )
    }

    const setters = merge(type.set, rule.set, (setter) => {
      if (!util.isFunction(setter)) {
        throw new Error(`invalid setter for "${name}".`)
      }

      return thenify(setter)
    })
    if (setters.length) {
      cleaned.set = setters
    }

    const validators = merge(type.validate, rule.validate, (validator) => {
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

    const tasks = Object.keys(this._rules)
    .map(key =>
      this._parse(key, data[key], data, args)
      .then(value => {
        values[key] = value
      })
    )

    return Promise.all(tasks)
    .then(() => values)
  }

  _parse (key, value, original, args) {
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

      return series(rule.validate, value, ...args)
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

      return waterfall(rule.set, value, ...args)
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
  return util.isFunction(validator)
    ? validator
    : util.isRegExp(validator)
      ? v => validator.test(v)
      : false
}
