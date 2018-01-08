const test = require('ava')
const skema = require('../src')
const {JS_TYPES} = skema

function delay (delay, value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, delay)
  })
}

const only = true

const RULES = {
  a: {
    default: 1,
    output: 1,
    d: 'default value'
  },

  a1: {
    output: undefined,
    d: 'undefined and no default'
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

  f2: {
    input: 1,
    error: 'invalid value "1" for key "f2"',
    validate: /\d{2}/,
    d: 'validate(regexp) fail'
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

  n2: {
    input: undefined,
    type: String,
    output: '',
    d: 'undefined string type'
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
    error: '"NaN" is not a number',
    d: 'invalid Number'
  },

  q: {
    input: '1',
    type: Number,
    output: 1,
    d: 'Number type'
  },

  q2: {
    input: '2018-01-01',
    type: Date,
    output: new Date('2018-01-01'),
    d: 'Date type'
  },

  q3: {
    input: '2018-01xxx01',
    type: Date,
    error: '"2018-01xxx01" is not a valid date',
    d: 'invalid Date'
  },

  r: {
    input: 'a<a>',
    type: 's',
    output: 'a',
    d: 'custom type'
  },

  s: {
    d: 'unknown type',
    type: 'unknown-type',
    initError: 'unknown type of "unknown-type" for "s"'
  }
}

const TYPES = {
  ...JS_TYPES,
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
    ? test.only
    : test

  _t(rule.d, t => {
    const data = {}

    if ('input' in rule) {
      data[key] = rule.input
    }

    const args = rule.args || []

    let s

    try {
      s = skema({
        rules: {
          [key]: get_rule(rule)
        },
        types: TYPES
      })

    } catch (e) {
      t.is(e.message, rule.initError)
      return
    }

    if (rule.initError) {
      t.fail('should fails to init')
      return
    }

    return s.parse(data, ...args)
    .then(
      value => {
        if (rule.error) {
          t.fail()
          return
        }

        t.is(isCleanObject(value), true, 'object is not clean')

        const v = value[rule.key || key]

        if (Object(value) === value) {
          t.deepEqual(v, rule.output)
        } else {
          t.is(v, rule.output)
        }

        t.is(value.toString, undefined)
      },

      error => {
        if (!rule.error) {
          t.fail(`should not fail: ${error.stack}`)
          return
        }

        if (typeof error === 'string') {
          t.is(error, rule.error)
          return
        }

        if (error instanceof Error) {
          t.is(error.message, rule.error)
        }

      }
    )
  })
})


test('all', t => {
  const data = {}
  const expected = {}
  const keys = Object.keys(RULES)
  const rules = {}

  keys.forEach((key) => {
    const rule = RULES[key]

    if (rule.initError || rule.error || 'args' in rule) {
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

  return skema({
    rules,
    types: TYPES
  })
  .parse(data)
  .then((values) => {
    t.deepEqual(values, expected)
  })
  .catch(() => {
    t.fail()
  })
})


test('default context', t => {
  return skema({
    rules: {
      a: {
        set (v) {
          return v + 1
        }
      },

      b: {
        set (v) {
          return v + this.a
        }
      }
    }
  })
  .parse({
    a: 2,
    b: 2
  })
  .then(result => {
    t.deepEqual(result, {
      a: 3,
      b: 4
    })
  })
})


test('parallel', t => {
  return skema({
    rules: {
      a: {
        set (v) {
          return delay(20)
          .then(() => {
            this.x = 2

            return v
          })
        }
      },

      b: {
        set (v) {
          return v + (this.x || 0)
        }
      }
    }
  })
  .parse({
    a: 1,
    b: 2
  })
  .then(result => {
    t.deepEqual(result, {a: 1, b: 2})
  })
})


test('parallel, and context', t => {
  return skema({
    rules: {
      a: {
        set (v) {
          return v + 1
        }
      },

      b: {
        validate (v) {
          return delay(20)
          .then(() => {
            return v > this.a
          })
        }
      }
    }
  })
  .parse({
    a: 1,
    b: 2
  })
  .then(result => {
    t.deepEqual(result, {a: 2, b: 2})
  })
  .catch(() => {
    t.fail('context should not change when runs in parallel')
  })
})


test('no parallel, and context', t => {
  return skema({
    rules: {
      a: {
        set (v) {
          return v + 1
        }
      },

      b: {
        validate (v) {
          return delay(20)
          .then(() => {
            return v > this.a
          })
        }
      }
    },
    parallel: false
  })
  .parse({
    a: 1,
    b: 2
  })
  .then(result => {
    t.fail('context should change when not run in parallel')
  })
  .catch(err => {
    t.pass()
  })
})


test('no parallel', t => {
  return skema({
    rules: {
      a: {
        set (v) {
          return delay(20)
          .then(() => {
            this.x = 2

            return v
          })
        }
      },

      b: {
        set (v) {
          return v + (this.x || 0)
        }
      }
    },

    parallel: false
  })
  .parse({
    a: 1,
    b: 2
  })
  .then(result => {
    t.deepEqual(result, {a: 1, b: 4})
  })
})


test('clean', t => {
  return skema({
    rules: {
      a: {
      }
    },
    clean: true
  })
  .parse({
    a: 1,
    b: 2
  })
  .then(result => {
    t.deepEqual(result, {
      a: 1
    })
  })
})


test('enumerable: false', t => {
  return skema({
    rules: {
      a: {
        enumerable: false
      }
    }
  })
  .parse({
    a: 1
  })
  .then(result => {
    t.is(result.a, 1, 'value')
    t.is(Object.keys(result).length, 0, 'enumerable: false')
  })
})


test('writable: false', t => {
  return skema({
    rules: {
      a: {
        writable: false
      }
    }
  })
  .parse({
    a: 1
  })
  .then(result => {
    t.is(result.a, 1, 'value')

    try {
      result.a = 2
      t.fail('should not allow to write')
    } catch (e) {
    }
  })
})


test('when', t => {
  return skema({
    rules: {
      a: {
        when () {
          return this.x > 0
        },

        validate (v) {
          return v > 10
        }
      }
    }
  })
  .parse({
    a: 1,
    x: 0
  })
  .then(result => {
    t.deepEqual(result, {a: 1, x: 0})
  })
})

test('literal when', async t => {
  const result = await skema({
    rules: {
      foo: {
        when: false,
        validate: () => false
      }
    }
  }).parse({foo: 1})

  t.is(result.foo, 1)
})

test('.type()', async t => {
  const result = await skema()
  .type('number', {
    set (v) {
      return Number(v) || 0
    }
  })
  .rule('foo', {
    type: 'number'
  })
  .parse({foo: '100'})

  t.is(result.foo, 100)
})

test('.type() with Type', async t => {
  const result = await skema()
  .type('number', new skema.Type({
    set (v) {
      return Number(v) || 0
    }
  }))
  .rule('foo', {
    type: 'number'
  })
  .parse({foo: '100'})

  t.is(result.foo, 100)
})

test('.type() with Types', async t => {
  const types = new skema.Types({
    number: {
      set (v) {
        return Number(v) || 0
      }
    }
  })
  const result = await skema({types})
  .rule('foo', {
    type: 'number'
  })
  .parse({foo: '100'})

  t.is(result.foo, 100)
})

test('invalid setter', async t => {
  try {
    skema({rules: {
      foo: {set: 1}
    }})
  } catch (e) {
    t.is(e.code, 'INVALID_SETTER')
    return
  }

  t.fail('should throw')
})

test('invalid validator', async t => {
  try {
    skema({rules: {
      foo: {validate: 1}
    }})
  } catch (e) {
    t.is(e.code, 'INVALID_VALIDATOR')
    return
  }

  t.fail('should throw')
})

test('property priority', async t => {
  const result = await skema({
    rules: {
      foo: {
        type: 'a',
        enumerable: true
      },
      bar: {
        type: 'a'
      }
    },
    types: {
      a: {
        enumerable: false
      }
    }
  }).parse({foo: 1, bar: 2})

  t.is(result.foo, 1, 'foo')
  t.is(result.bar, 2, 'bar')
  t.is(isEnumerable(result, 'foo'), true)
  t.is(isEnumerable(result, 'bar'), false)
})

function isEnumerable (obj, key) {
  return Object.prototype.propertyIsEnumerable.call(obj, key)
}

function isCleanObject (obj) {
  return obj.toString === undefined
}
