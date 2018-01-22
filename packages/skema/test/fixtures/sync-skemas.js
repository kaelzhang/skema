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
    type
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

  return {
    cases
  }
}
