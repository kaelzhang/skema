import test from 'ava'
import {run} from './lib/runner'
import {cases} from './fixtures/async-schemas'

cases.forEach(run({
  async: true
}))
