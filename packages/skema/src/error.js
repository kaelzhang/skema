import {Errors} from 'err-object'
const {E, error, i18n} = new Errors()

E('ERR_NOT_A_NUMBER', {
  message: '"%s" is not a number',
  ctor: TypeError
})

E('ERR_NOT_A_DATE', {
  message: '"%s" is not a valid date',
  ctor: TypeError
})

E('ERR_NOT_A_FUNCTION', {
  message: '"%s" is not a function',
  ctor: TypeError
})

E('UNKNOWN_TYPE', {
  message: 'unknown type of "%s" for "%s"',
  ctor: RangeError
})

E('INVALID_SETTER', {
  message: 'invalid setter, only functions are accepted',
  ctor: TypeError
})

E('INVALID_VALIDATOR', {
  message: 'invalid validator for "%s", only functions or regular expressions are accepted',
  ctor: TypeError
})

E('NOT_FUNCTION', {
  message: '%s must be a function',
  ctor: TypeError
})

E('VALIDATE_FAILS', {
  message: 'invalid value "%s" for key "%s"'
})

module.exports = {error, i18n}
