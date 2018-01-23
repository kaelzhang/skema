import {Errors} from 'err-object'
import util from 'util'
const {E, error} = new Errors()

E('REDEFINE_TYPE', {
  message: 'type \'%s\' should be defined again',
  ctor: Error
})

E('UNKNOWN_TYPE', {
  message: 'unknown type \'%s\'',
  ctor: RangeError
})

E('INVALID_TYPE_NAME', {
  message: 'invalid type name \'%s\'',
  ctor: TypeError
})

E('NON_OBJECT_TYPES', {
  message: 'types must be an object',
  ctor: TypeError
})

E('EMPTY_ARRAY_TYPE', {
  message: 'empty type array',
  ctor: TypeError
})

E('INVALID_SKEMA', {
  message: 'invalid skema definition',
  ctor: TypeError
})

E('INVALID_SETTER', {
  message: 'invalid setter, only functions are accepted',
  ctor: TypeError
})

E('INVALID_VALIDATOR', {
  message: 'invalid validator for \'%s\', only functions or regular expressions are accepted',
  ctor: TypeError
})

E('VALIDATE_FAILS', {
  message (value, key) {
    value = util.inspect(value)
    if (key) {
      return util.format('invalid value %s for key \'%s\'', value, key)
    }

    return util.format('invalid value %s', value)
  }
})

E('NOT_OPTIONAL', {
  message: key => util.format(
    'key %s is not optional', util.inspect(key)),
  ctor: Error
})

export {error}
