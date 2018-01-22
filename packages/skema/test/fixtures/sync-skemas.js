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
    declare
  } = defaults({
    async,
    types
  })

  const Depth1 = skema({
    a: Number,
    b: 'string',
    c: Boolean
  })

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

  return {
    cases
  }
}
