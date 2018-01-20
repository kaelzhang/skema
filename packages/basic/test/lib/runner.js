import test from 'ava'
import {defaults} from 'skema'

export function run (types) {
  const {skema} = defaults({
    types
  })

  return ([type, Type, input, output, error]) => {
    [type, Type].forEach(type => {
      test(`${type.name || type}:input:${output},output:${output}`, t => {
        const Skema = skema({
          foo: type
        })

        let o

        try {
          o = Skema.from({foo: input})
        } catch (e) {
          if (!error) {
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

        t.is(o.foo, output, 'result not match')
      })
    })
  }
}
