const test = require('ava')
const skema = require('..')

function delay (delay, value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, delay)
  })
}

const RULES = {
  a: {
    default: 1,
    output: 1,
    d: 'default value'
  },

  b: {
    default: () => {
      return 1
    },
    output: 1,
    d: 'default function'
  },

  c: {
    default: () => {
      return delay(10, 1)
    },
    output: 1,
    d: 'default function, returns promise'
  },

  d: {
    default: (a, b) => {
      return a + b
    },
    args: [1, 2],
    output: 3,
    d: 'default function, with arguments'
  },

  e: {
    default: 1,
    input: 2,
    output: 2,
    d: 'not default'
  },

  f: {
    input: 1,
    error: 'invalid value "1" for key "f"',
    validate: (v) => {
      return v > 1
    },
    d: 'validate fail'
  },

  g: {
    input: 1,
    error: 'invalid value "1" for key "g"',
    validate: (v) => {
      return delay(10, false)
    },
    d: 'async validator'
  },

  h: {
    input: 1,
    error: 'invalid value "1" for key "h"',
    validate: [
      () => true,
      () => false
    ],
    d: 'multiple validators'
  },

  i: {
    input: 1,
    error: 'abc',
    validate: () => Promise.reject('abc'),
    d: 'custom error message'
  },

  j: {
    input: 1,
    error: 'abc',
    validate: [
      () => true,
      () => Promise.reject('abc'),
      () => true
    ],
    d: 'multiple validate and custom error message'
  },

  k: {
    input: 1,
    set: (v) => {
      return v + 1
    },
    output: 2,
    d: 'setter'
  },

  l: {
    input: 1,
    set: (v) => {
      return delay(10, 2)
    },
    output: 2,
    d: 'async setter'
  },

  m: {
    input: 1,
    set: [
      (v) => v + 1,
      (v) => delay(10, v + 1)
    ],
    output: 3,
    d: 'multiple setter'
  },

  n: {
    input: 1,
    type: 'string',
    output: '1',
    d: '"string" type'
  },

  o: {
    input: 1,
    type: String,
    output: '1',
    d: 'String type'
  },

  p: {
    input: 'a',
    type: Number,
    error: 'not a number.',
    d: 'invalid Number'
  },

  q: {
    input: '1',
    type: Number,
    output: 1,
    d: 'Number type'
  },

  r: {
    input: 'a<a>',
    type: 's',
    output: 'a',
    d: 'custom type'
  }
}

const TYPES = {
  's': {
    set: (v) => {
      return v.replace(/\<.*\>/g, '')
    }
  }
}


function get_rule (raw) {
  const rule = {}

  ;['default', 'set', 'validate', 'type'].forEach((name) => {
    if (name in raw) {
      rule[name] = raw[name]
    }
  })

  return rule
}


Object.keys(RULES).forEach((key) => {
  const rule = RULES[key]
  const _t = rule.only
    ? test.only.cb
    : test.cb

  _t(rule.d, t => {
    const data = {}

    if ('input' in rule) {
      data[key] = rule.input
    }

    const args = rule.args || []

    skema({
      rules: {
        [key]: get_rule(rule)
      },
      types: TYPES
    })
    .parse(data, ...args)
    .then(
      value => {
        if (rule.error) {
          t.fail()
          t.end()
          return
        }

        const v = value[key]

        if (Object(value) === value) {
          t.deepEqual(v, rule.output)
        } else {
          t.is(v, rule.output)
        }

        t.end()
      },
      error => {
        if (!rule.error) {
          t.fail(`should not fail: ${error.stack}`)
          t.end()
          return
        }

        t.is(error.message, rule.error)
        if ('input' in rule) {
          t.is(error.value, rule.input)
        }
        t.is(error.key, key)
        t.end()
      }
    )
  })
})


test.cb('all', t => {
  const data = {}
  const expected = {}
  const keys = Object.keys(RULES)
  const rules = {}

  keys.forEach((key) => {
    const rule = RULES[key]

    if (rule.error || 'args' in rule) {
      return
    }

    if (!rule.no_rule) {
      rules[key] = get_rule(rule)
    }

    if ('input' in rule) {
      data[key] = rule.input
    }

    if ('output' in rule) {
      expected[key] = rule.output
    }
  })

  const s = skema({
    rules,
    types: TYPES
  })
  .parse(data)
  .then((values) => {
    t.deepEqual(values, expected)
    t.end()
  })
  .catch(() => {
    t.fail()
    t.end()
  })
})
