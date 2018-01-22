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

  const Depth1 = skema({
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

  const Depth2 = skema({
    d: Depth1
  })

  // 1
  cases.push({
    d: 'structure depth:2',
    s: Depth2,
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
    output: 'error todo',
    e: true
  })

  const Depth1WithOptProp = skema({
    a: Number,
    b: {
      type: String,
      optional: true
    }
  })

  // 3
  cases.push({
    d: 'structure optional',
    s: Depth1WithOptProp,
    input: {
      a: 1
    },
    output: {
      a: 1
    }
  })

  const Depth1WithOptPropCreator = skema({
    a: Number,
    b: type(String).optional()
  })

  // 4
  cases.push({
    d: 'structure optional',
    s: Depth1WithOptPropCreator,
    input: {
      a: 1
    },
    output: {
      a: 1
    }
  })

  const TypeDefault = type({
    default: 1
  })

  const Depth1WithTypeDefault = skema({
    a: TypeDefault
  })

  // 5
  cases.push({
    d: 'default value',
    s: Depth1WithTypeDefault,
    input: {},
    output: {
      a: 1
    }
  })

  const TypeWhen = type({
    when () {
      return !!this.parent.b
    }
  })

  const TypeWhenAndAlwaysFail = type({
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
    s: skema({
      a: TypeWhenAndAlwaysFail
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
    s: skema({
      a: TypeWhenAndAlwaysFail
    }),
    input: {
      a: 1,
      b: 2
    },
    output: 'error todo',
    e: true
  })

  // 8
  cases.push({
    d: 'when and not skip, not fails',
    s: skema({
      a: TypeWhen
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

  const TypeFunctionValidator = type({
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
    output: 'error todo',
    e: true
  })

  const TypeRegExpValidator = type({
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
    output: 'error todo',
    e: true
  })

  const TypeArrayValidator = type({
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
    output: 'error todo',
    e: true
  })

  cases.push({
    d: 'array validators, fails 0',
    s: TypeArrayValidator,
    input: 0,
    output: 'error todo',
    e: true
  })

  cases.push({
    d: 'array validators, fails 1',
    s: TypeArrayValidator,
    input: 1,
    output: 'foo',
    e: true
  })

  cases.push({
    d: 'array validators, not fails',
    s: TypeArrayValidator,
    input: 2,
    output: 2
  })

  const TypeObjectOf = objectOf(String)
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

  const TypeArrayOf = arrayOf(String)
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
    output: 'error todo',
    e: true
  })

  cases.push({
    d: 'sparse array of string, optional',
    s: arrayOf(type(String).optional()),
    input: createSparseArray(2, 1),
    output: createSparseArray(2, '1')
  })

  return {
    cases
  }
}
