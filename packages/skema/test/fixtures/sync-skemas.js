import {defaults} from '../../src'
import {LOOSE} from '@skema/basic'
import path from 'path'

const date = new Date
const only = true

export const factory = ({
  async,
  clean
}) => {
  const types = {
    ...LOOSE,
    path: {
      type: path,
      definition: {
        set: path.resolve
      }
    }
  }

  const cases = []

  const {
    skema,
    type,
    objectOf,
    arrayOf,
    declare
  } = defaults({
    async,
    clean,
    types
  })

  const Depth1 = () => skema({
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

  const Depth2 =

  // 1
  cases.push({
    d: 'structure depth:2',
    s () {
      return skema({
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
      parent: {
        a: 1,
        b: 2
      },
      args: ['c']
    },
    e: true
  })

  // 3
  cases.push({
    d: 'structure optional',
    s: () => skema({
      a: Number,
      b: type({
        type: String,
        optional: true
      })
    }),
    input: {
      a: 1
    },
    output: {
      a: 1
    }
  })

  // 4
  cases.push({
    d: 'structure optional, optional creator',
    s: () => skema({
      a: Number,
      b: skema(String).optional()
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
    s: () => skema({
      a: TypeDefault()
    }),
    input: {},
    output: {
      a: 1
    }
  })

  cases.push({
    d: 'parent default value',
    s: () => skema({
      a: type({
        type: TypeDefault()
      })
    }),
    input: {},
    output: {
      a: 1
    }
  })

  const TypeWhen = () => type({
    when () {
      return !!this.parent.b
    }
  })

  const TypeWhenAndAlwaysFail = () => type({
    when () {
      return this.parent.b > 1
    },
    validate () {
      return false
    }
  })

  // 6
  cases.push({
    d: 'when and skip',
    s: () => skema({
      a: TypeWhenAndAlwaysFail()
    }),
    input: {
      a: 1,
      b: 1
    },
    output: clean
      ? {}
      : {
        a: 1,
        b: 1
      }
  })

  // 7
  cases.push({
    d: 'when and not skip, fails',
    s: () => skema({
      a: TypeWhenAndAlwaysFail()
    }),
    input: {
      a: 1,
      b: 2
    },
    output: {
      code: 'VALIDATE_FAILS',
      message: 'invalid value 1 for key \'a\'',
      args: [1, 'a'],
      value: 1,
      path: ['a']
    },
    e: true
  })

  // 8
  cases.push({
    d: 'when and not skip, not fails',
    s: () => skema({
      a: TypeWhen()
    }),
    input: {
      a: 1,
      b: 2
    },
    output: clean
      ? {
        a: 1
      }
      : {
        a: 1,
        b: 2
      }
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
    d: 'array validators, fails 0',
    s: TypeArrayValidator,
    input: 0,
    output: {
      code: 'VALIDATE_FAILS',
      message: 'invalid value 0',
      path: [],
      value: 0
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
      value: 1
    },
    e: true
  })

  cases.push({
    d: 'array validators, not fails',
    s: TypeArrayValidator,
    input: 2,
    output: 2
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
    s: () => skema({
      a: skema({
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
    s: () => skema({
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
    s: () => arrayOf(skema(String).optional()),
    input: createSparseArray(2, 1),
    output: createSparseArray(2, '1')
  })

  return {
    cases
  }
}
