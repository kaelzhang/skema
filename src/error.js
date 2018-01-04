const {Errors} = require('err-object')
const {E, error, i18n} = new Errors()

E('ERR_NOT_A_NUMBER', {
  message: 'not a number',
  ctor: TypeError
})

E('ERR_NOT_A_DATE', {
  message: '"%s" is not a valid date',
  ctor: TypeError
})

E('INVALID_TYPE', {
  message: 'a type must have either default, set, or validate',
  ctor: TypeError
})

module.exports = {error, i18n}
