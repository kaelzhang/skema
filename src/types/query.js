const javascript = require('./javascript')

const query = {
  ...javascript
}


query.boolean = {
  ...javascript.boolean,

  set (value) {
    if (typeof value === 'boolean') {
      return value
    }

    if (
      !value
      || value === '0'
      || value === 'null'
      || value === 'false'
    ) {
      return false
    }

    return true
  }
}


module.exports = query
