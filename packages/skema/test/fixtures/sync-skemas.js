import {defaults} from '../../src'
import {LOOSE} from '@skema/basic'
import path from 'path'

const date = new Date
const only = true

export const factory = ({
  async
}) => {
  const types = [
    ...LOOSE,
    {
      name: ['path', path],
      definition: {
        set: p => path.resolve(__dirname, p)
      }
    }
  ]

  const cases = []

  const {
    shape,
    type,
    objectOf,
    arrayOf,
    declare,
    any,
    set
  } = defaults({
    async,
    types
  })

  cases.push({
    d: 'custom path',
    s: () => shape({
      a: 'path'
    }),
    input: {
      a: '../../sync.js'
    },
    output: {
      a: path.join(__dirname, '../../sync.js')
    }
  })

  const Depth1 = () => shape({
    a: Number,
    b: 'string',
    c: Boolean
  })

  // 0
  cases.push({
    d: 'structure',
    s: Depth1,
    input: {
      a: 1,
      b: 2,
      c: 3
    },
    output: {
      a: 1,
      b: '2',
      c: true
    }
  })

  cases.push({
    d: 'structure, type assignment',
    s: Depth1,
    input: {
      a: 1,
      b: 2,
      c: 3
    },
    async: false,
    output: {
      a: 1,
      b: '2',
      c: true
    },
    after (t, o) {
      o.b = 4
      t.is(o.b, '4', 'after not match')
    }
  })

  cases.push({
    d: 'structure, type assignment, async',
    s: Depth1,
    input: {
      a: 1,
      b: 2,
      c: 3
    },
    async: true,
    output: {
      a: 1,
      b: '2',
      c: true
    },
    async after (t, o) {
      const value = await set(o, 'b', 4)
      t.is(value, '4', 'result value')
      t.is(o.b, '4', 'after not match')

      try {
        await set({}, 'a', 1)
      } catch (e) {
        t.is(e.code, 'SHAPE_NOT_FOUND', 'set on non skema object')
        return
      }

      t.fail('should fail')
    }
  })

  // 1
  cases.push({
    d: 'structure depth:2',
    s () {
      return shape({
        d: Depth1()
      })
    },
    input: {
      d: {
        a: 1,
        b: 2,
        c: 3
      }
    },
    output: {
      d: {
        a: 1,
        b: '2',
        c: true
      }
    }
  })

  // 2
  cases.push({
    d: 'structure not optional but missing',
    s: Depth1,
    input: {
      a: 1,
      b: 2
    },
    output: {
      code: 'NOT_OPTIONAL',
      message: 'key \'c\' is not optional',
      path: ['c'],
      args: ['c']
    },
    e: true
  })

  // 3
  cases.push({
    d: 'structure optional',
    s: () => shape({
      a: Number,
      b: {
        type: String,
        optional: true
      }
    }),
    input: {
      a: 1
    },
    output: {
      a: 1
    }
  })

  cases.push({
    d: 'structure optional, string syntax',
    s: () => shape({
      a: Number,
      b: 'string?'
    }),
    input: {
      a: 1
    },
    output: {
      a: 1
    }
  })

  const TypeDefault = () => type({
    default: 1
  })

  // 5
  cases.push({
    d: 'default value',
    s: () => shape({
      a: TypeDefault()
    }),
    input: {},
    output: {
      a: 1
    }
  })

  cases.push({
    d: 'parent default value',
    s: () => shape({
      a: {
        type: TypeDefault()
      }
    }),
    input: {},
    output: {
      a: 1
    }
  })

  cases.push({
    d: 'function default',
    s: () => shape({
      a: type({
        default () {
          return 1
        }
      })
    }),
    input: {},
    output: {
      a: 1
    }
  })

  const TypeWhen = () => type({
    when () {
      return !!this.rawParent.b
    }
  })

  const TypeWhenAndAlwaysFail = () => type({
    when () {
      return this.rawParent.b > 1
    },
    validate () {
      return false
    }
  })

  function whetherClean (factory, cleanOutput, output) {
    createClean(factory, true, cleanOutput)
    // createClean(factory, false, output)
  }

  function createClean (factory, clean, output) {
    const c = factory(clean)
    cases.push({
      ...c,
      d: `${c.d}, clean:${clean}`,
      output
    })
  }

  whetherClean(clean => {
    return {
      d: 'when and skip',
      s: () => shape({
        a: TypeWhenAndAlwaysFail()
      }, clean),
      input: {
        b: 1,
        a: 1
      }
    }
  }, {}, {a: 1, b: 1})

  whetherClean(clean => {
    return {
      d: 'when and skip, parent',
      s: () => shape({
        a: {
          type: TypeWhenAndAlwaysFail()
        }
      }, clean),
      input: {
        b: 1,
        a: 1
      }
    }
  }, {}, {
    a: 1,
    b: 1
  })

  // 7
  cases.push({
    d: 'when and not skip, fails',
    s: () => shape({
      a: TypeWhenAndAlwaysFail()
    }),
    input: {
      b: 2,
      a: 1
    },
    output: {
      code: 'VALIDATION_FAILS',
      message: 'invalid value 1 for key \'a\'',
      args: [1, 'a'],
      input: 1,
      path: ['a']
    },
    e: true
  })

  whetherClean(clean => {
    return {
      d: 'always skip with when:false',
      s: () => shape({
        a: {
          when: false,
          validate: () => false
        }
      }, clean),
      input: {
        a: 1
      }
    }
  }, {}, {a: 1})

  whetherClean(clean => {
    return {
      d: 'when and not skip, not fails',
      s: () => shape({
        a: TypeWhen()
      }, clean),
      input: {
        b: 2,
        a: 1
      }
    }
  }, {
    a: 1
  }, {
    a: 1,
    b: 2
  })

  // 9
  cases.push({
    d: 'just TypeWhen, when is invalid if no parent',
    s: TypeWhen,
    input: 1,
    output: 1
  })

  const TypeFunctionValidator = () => type({
    validate: v => v > 0
  })

  // 9
  cases.push({
    d: 'function validator',
    s: TypeFunctionValidator,
    input: 1,
    output: 1
  })

  // 9
  cases.push({
    d: 'function validator, fails',
    s: TypeFunctionValidator,
    input: 0,
    output: {
      message: 'invalid value 0'
    },
    e: true
  })

  const TypeRegExpValidator = () => type({
    validate: /^[a-z]+$/
  })

  cases.push({
    d: 'regexp validator',
    s: TypeRegExpValidator,
    input: 'abc',
    output: 'abc'
  })

  cases.push({
    d: 'regexp validator, fails',
    s: TypeRegExpValidator,
    input: 'abc1',
    output: {
      message: 'invalid value \'abc1\''
    },
    e: true
  })

  const TypeArrayValidator = () => type({
    validate: [
      v => v > 0,
      v => {
        if (v > 1) {
          return true
        }

        throw 'foo'
      }
    ]
  })

  cases.push({
    d: 'array validators, fails 0, throw string',
    s: TypeArrayValidator,
    input: 0,
    output: {
      code: 'VALIDATION_FAILS',
      message: 'invalid value 0',
      path: [],
      input: 0
    },
    e: true
  })

  cases.push({
    d: 'array validators, fails 1',
    s: TypeArrayValidator,
    input: 1,
    output: {
      code: 'CUSTOM_ERROR',
      message: 'foo',
      path: [],
      input: 1
    },
    e: true
  })

  cases.push({
    d: 'array validators, fails 1, throw error',
    s: () => type({
      validate: [
        v => v > 0,
        v => {
          if (v > 1) {
            return true
          }

          throw new Error('foo')
        }
      ]
    }),
    input: 1,
    output: {
      code: 'CUSTOM_ERROR',
      message: 'foo',
      path: [],
      input: 1
    },
    e: true
  })

  cases.push({
    d: 'array validators, not fails',
    s: TypeArrayValidator,
    input: 2,
    output: 2
  })

  cases.push({
    d: 'invalid validator',
    s: () => shape({
      a: type({
        validate: 1
      })
    }),
    output: {
      code: 'INVALID_VALIDATOR'
    },
    se: true
  })

  const TypeSetter = () => type({
    set () {
      return 1
    }
  })

  cases.push({
    d: 'function setter',
    s: TypeSetter,
    input: 100,
    output: 1
  })

  const TypeSetterThrows = () => type({
    set () {
      throw 'foo'
    }
  })

  cases.push({
    d: 'type setter that throws, with hierarchies',
    s: () => shape({
      a: shape({
        b: TypeSetterThrows()
      })
    }),
    input: {
      a: {
        b: 1
      }
    },
    output: {
      message: 'foo',
      code: 'CUSTOM_ERROR',
      path: ['a', 'b']
    },
    e: true
  })

  cases.push({
    d: 'type array of setters',
    s: () => shape({
      a: type({
        set: [() => 1, i => i + 1]
      })
    }),
    input: {
      a: 100
    },
    output: {
      a: 2
    }
  })

  cases.push({
    d: 'invalid setter',
    s: () => shape({
      a: type({
        set: 1
      })
    }),
    output: {
      code: 'INVALID_SETTER'
    },
    se: true
  })

  const TypeObjectOf = () => objectOf(String)
  cases.push({
    d: 'object of String',
    s: TypeObjectOf,
    input: {
      a: '1',
      b: 1,
      c: {toString: () => 'foo'}
    },
    output: {
      a: '1',
      b: '1',
      c: 'foo'
    }
  })

  const TypeArrayOf = () => arrayOf(String)
  cases.push({
    d: 'array of String',
    s: TypeArrayOf,
    input: [1, '1', {toString: () => 'foo'}],
    output: ['1', '1', 'foo']
  })

  const createSparseArray = (i, value) => {
    const sparseArray = []
    sparseArray[i] = value
    return sparseArray
  }


  cases.push({
    d: 'sparse array of String, fails due to required',
    s: TypeArrayOf,
    input: createSparseArray(2, 1),
    output: {
      message: 'key 0 is not optional',
      key: 0
    },
    e: true
  })

  cases.push({
    d: 'sparse array of string, optional',
    s: () => arrayOf({
      type: String,
      optional: true
    }),
    input: createSparseArray(2, 1),
    output: createSparseArray(2, '1')
  })

  cases.push({
    d: 'array shape',
    s: () => shape([String, Number]),
    input: [1, '1'],
    output: ['1', 1]
  })

  cases.push({
    d: 'empty type',
    s: () => {
      const {
        type
      } = defaults()

      return type(Number)
    },
    output: {
      code: 'EMPTY_TYPE'
    },
    se: true
  })

  cases.push({
    d: 'empty type',
    s: () => type({}),
    output: {
      code: 'EMPTY_TYPE'
    },
    se: true
  })

  // cases.push({
  //   d: 're-skema',
  //   s: () => shape(shape({a: Number})),
  //   input: {
  //     a: '1'
  //   },
  //   output: {
  //     a: 1
  //   }
  // })

  cases.push({
    d: 'number type skema alias',
    s: () => {
      declare(1, type(Number))
    },
    output: {
      code: 'INVALID_TYPE_NAME'
    },
    se: true
  })

  cases.push({
    d: 'invalid skema',
    s: () => type(1),
    output: {
      code: 'INVALID_TYPE'
    },
    se: true
  })

  whetherClean(clean => {
    return {
      d: 'any',
      s: () => shape({
        a: any(),
        b: any(),
        c: any()
      }, clean),
      input: {
        a: 1,
        b: '2',
        c: false,
        d: 3
      }
    }
  }, {
    a: 1,
    b: '2',
    c: false
  }, {
    a: 1,
    b: '2',
    c: false,
    d: 3
  })

  cases.push({
    d: 'invalid types error',
    s: () => defaults({
      types: true
    }),
    output: {
      code: 'NON_ARRAY_TYPES'
    },
    se: true
  })

  cases.push({
    d: 'unknown type error',
    s: () => shape({a: 'unknown'}),
    output: {
      code: 'UNKNOWN_TYPE'
    },
    se: true
  })

  cases.push({
    d: 're-declare type error',
    s: () => declare('string', shape(String)),
    output: {
      code: 'REDECLARE_TYPE'
    },
    se: true
  })

  cases.push({
    d: 're-declare Object type error',
    s: () => declare(String, shape(String)),
    output: {
      code: 'REDECLARE_TYPE',
      message: 'type \'String\' should not be declared again'
    },
    se: true
  })

  cases.push({
    d: 're-declare type error',
    s: () => declare(String, shape(String)),
    output: {
      code: 'REDECLARE_TYPE'
    },
    se: true
  })

  const TypeDescriptor = () => type({
    writable: false,
    configurable: false,
    enumerable: false
  })

  const TypeDescriptorOutput = ({
    enumerable,
    configurable
  } = {}) => (t, o) => {
    const descriptor = Object.getOwnPropertyDescriptor(o, 'a')

    t.is(descriptor.enumerable, !!enumerable)
    t.is(descriptor.configurable, !!configurable)
    t.is(o.a, 1)
  }

  cases.push({
    d: 'descriptor',
    s: () => shape({
      a: TypeDescriptor()
    }),
    input: {
      a: 1
    },
    output: TypeDescriptorOutput(),
    async after (t, o) {
      if (async) {
        return
      }

      try {
        o.a = 2
      } catch (e) {
        t.is(e.code, 'NOT_WRITABLE', 'should not be writable')
        return
      }

      t.fail('after should fail')
    }
  })

  cases.push({
    d: 'recreate type',
    s: () => {
      const t = type({
        set: x => x
      })

      if (type(t) !== t) {
        throw 'type should equal'
      }
      return t
    },
    input: 1,
    output: 1
  })

  const properties = [
    'enumerable',
    'configurable'
  ]

  properties.forEach(key => {
    cases.push({
      d: `descriptor, inherit, ${key}`,
      s: () => shape({
        a: {
          type: TypeDescriptor(),
          [key]: true
        }
      }),
      input: {
        a: 1
      },
      output: TypeDescriptorOutput({[key]: true})
    })
  })

  const OptionalNumber = type({
    type: Number,
    optional: true
  })

  declare('optional-number', OptionalNumber)

  cases.push({
    d: 'type already optional',
    s: () => shape({
      a: 'optional-number?',
      b: 'number'
    }),
    input: {
      b: 1
    },
    output: {
      b: 1
    }
  })

  cases.push({
    d: 'array shape with clean',
    s: () => shape([Number,,Number], true),
    input: [1, 2, 3],
    output: [1,,3]
  })

  return {
    cases
  }
}
