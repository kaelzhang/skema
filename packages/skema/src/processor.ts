// Processor to run the flow async or sync
///////////////////////////////////////////////////////////
import {Options} from './options'
import {UNDEFINED} from './util'

export class Processor {
  constructor (options) {
    Object.assign(this, options)

    const {
      key,
      origin
    } = this.context.context
    this._isDefault = key in origin
  }

  process () {
    return this.options.promise.resolve()
    .then(() => this.shouldSkip())
    .then(skip => {
      if (skip) {
        return
      }

      const {
        value,
        context
      } = this.context

      return this.skema.validate(value, this.args, context)
      .then(valid => {
        if (!valid) {
          // Other errors are rejected
          throw 'validate fail'
        }

        return this.skema.set(value, this.args, context)
      })
      .then(value => {
        this.context.value = value
      })
    })
  }

  processDone () {
    const {
      values,
      skema
    } = this

    const {value} = this.context
    const {key} = this.context.context

    const config = Object.create(null)
    configure(config, 'configurable', skema)
    configure(config, 'enumerable', skema)
    configure(config, 'writable', skema)

    defineProperty(this.values, key, value, config)
  }

  // Returns whether we should skip checking
  shouldSkip () {
    const {skema} = this

    if (!skema.hasWhen()) {
      return this._shouldSkip()
    }

    return skema.when(this.args, this.context.context)
    .then(hit => {
      if (!hit) {
        // Skip
        return true
      }

      return this._shouldSkip()
    })
  }

  _shouldSkip () {
    const {skema} = this

    // has the key
    if (!this._isDefault) {
      // not skip
      return false
    }

    // If the key is required,
    // optional and default are mutual exclusive,
    // so we simply check optional first.
    if (!skema.isOptional()) {
      throw 'is not optional'
    }

    if (!skema.hasDefault()) {
      // skip
      return true
    }

    return skema.default(this.args, this.context.context)
    .then(value => {
      this.context.value = value
      return false
    })
  }

  // processWhen () {
  //   const when = this.rule.when || this.type.when
  //   if (!when) {
  //     return true
  //   }
  //
  //   return when.apply(this.context, this.args)
  // }
  //
  // processDefault () {
  //   const isDefault = !(this.key in this.data)
  //   if (!isDefault) {
  //     return
  //   }
  //
  //   const _default = this.rule.default || this.type.default
  //
  //   if (!_default) {
  //     return
  //   }
  //
  //   return Promise.resolve(_default.apply(this.context, this.args))
  //   .then(value => this.value = value)
  // }
  //
  // processValidator (validator) {
  //   if (!validator) {
  //     return
  //   }
  //
  //   return series.call(this, validator, runValidate)
  // }
  //
  // processSetter (setter) {
  //   if (!setter) {
  //     return
  //   }
  //
  //   return waterfall.call(this, setter, this.value, runSetter)
  //   .then(value => this.value = value)
  // }
}

// function runValidate (validator) {
//   return Promise.resolve(
//     validator.call(this.context, this.value, this.args)
//   )
//   .then(pass => {
//     if (!pass) {
//       throw error('VALIDATE_FAILS', this.value, this.key)
//     }
//   })
// }
//
// function runSetter (prev, setter) {
//   return setter.call(this.context, prev, this.args)
// }

function configure (config, name, skema) {
  const value = skema[name]()

  if (value !== UNDEFINED) {
    config[name] = value
    return
  }

  // default to true
  config[name] = true
}
