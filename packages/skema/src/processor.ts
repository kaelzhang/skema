// Processor to run the flow async or sync
///////////////////////////////////////////////////////////
import {Options} from './options'

export class AbstractProcessor {
  constructor (options, async) {
  }

  from () {
    
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

    const _default = this.rule.default || this.type.default

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
