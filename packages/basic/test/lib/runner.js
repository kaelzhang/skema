import {inspect} from 'util'
import test from 'ava'
import {defaults} from 'skema'
import {isSymbol} from 'core-util-is'

function toString (value) {
  if (isSymbol(value)) {
    return 'Symbol'
  }

  if (value instanceof Error) {
    return `Error:${value.message}`
  }

  return inspect(value)
}

function typeName (type) {
  if (type === Symbol) {
    return 'Symbol'
  }

  return type.name || type
}

export function run (types, prefix) {
  const {shape} = defaults({
    types
  })

  return ([type, Type, input, output, error], i) => {
    [
      type,
      Type
    ].forEach(type => {
      const title = `${i}: ${prefix}: ${typeName(type)
        }:input:${toString(input)
        },output:${toString(output)}`

      test(title, t => {
        const Skema = shape({
          foo: type
        })

        let o

        try {
          o = Skema.from({foo: input})
        } catch (e) {
          if (!error) {
            console.log(e.stack)
            t.fail('should not fail')
            return
          }

          t.is(output, e.message, 'error message not match')
          return
        }

        if (error) {
          t.fail('should fail')
          return
        }

        if (isSymbol(output)) {
          t.is(isSymbol(o.foo), true)
          return
        }

        if (Object(output) === output) {
          t.deepEqual(o.foo, output, 'result not match')
          return
        }

        t.is(o.foo, output, 'result not match')
      })
    })
  }
}
