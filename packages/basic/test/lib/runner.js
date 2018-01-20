import test from 'ava'
import {skema} from '../../src'

export function run ([type, Type, input, output, error]) {
  [type, Type].forEach(type => {
    test(`${type}:input:${output},output:${output}`, t => {
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

        t.is(output, error, 'error message not match')
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
