import test from 'ava'
import {factory} from './fixtures/sync-skemas'
import {run} from './lib/runner'

function go (options) {
  factory(options).cases.forEach(run(options))
}

go({
  async: true
})
