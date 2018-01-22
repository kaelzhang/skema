import test from 'ava'
import {factory} from './fixtures/sync-skemas'
import {run} from './lib/runner'

const {
  cases
} = factory({
  async: false,
  clean: false
})

const runner = run()

cases.forEach(runner)
