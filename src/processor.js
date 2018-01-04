const {series, waterfall} = require('promise.extra')
const {error} = require('./error')
const {
  defineProperty
} = require('./util')

module.exports = class Processor {
  constructor (options) {
    Object.assign(this, options)
    this.value = this.data[this.key]
  }

  process () {
    return Promise.resolve(this.processWhen())
    .then(hit => {
      if (!hit) {
        return
      }

      return Promise.resolve(this.processDefault())
      .then(() => this.processValidator(this.type.validate))
      .then(() => this.processValidator(this.rule.validate))
      .then(() => this.processSetter(this.type.set))
      .then(() => this.processSetter(this.rule.set))
      .then(() => this.processDone())
    })
  }

  processWhen () {
    const when = this.rule.when || this.type.when
    if (!when) {
      return true
    }

    return when.apply(this.context, this.args)
  }

  processDefault () {
    const isDefault = !(this.key in this.data)
    if (!isDefault) {
      return
    }

    const _default = this.type.default || this.rule.default

    if (!_default) {
      return
    }

    return Promise.resolve(_default.apply(this.context, this.args))
    .then(value => this.value = value)
  }

  processValidator (validator) {
    if (!validator) {
      return
    }

    return series.call(this, validator, runValidate)
  }

  processSetter (setter) {
    if (!setter) {
      return
    }

    return waterfall.call(this, setter, this.value, runSetter)
    .then(value => this.value = value)
  }

  processDone () {
    const {key, value} = this

    if (!this.parallel) {
      this.context[key] = value
    }

    const {type, rule} = this
    const config = Object.create(null)
    configure(config, 'configurable', type, rule)
    configure(config, 'enumerable', type, rule)
    configure(config, 'writable', type, rule)

    defineProperty(this.values, key, value, config)
  }
}

function runValidate (validator) {
  return Promise.resolve(
    validator.call(this.context, this.value, this.args)
  )
  .then(pass => {
    if (!pass) {
      throw error('VALIDATE_FAILS', this.value, this.key)
    }
  })
}

function runSetter (prev, setter) {
  return setter.call(this.context, prev, this.args)
}

function configure (config, name, type, rule) {
  let value = rule[name]
  if (value !== undefined) {
    config[name] = value
    return
  }

  value = type[name]
  if (value !== undefined) {
    config[name] = value
    return
  }

  // default to true
  config[name] = true
}
