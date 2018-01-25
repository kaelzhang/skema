import prev from './rollup'
import builtins from 'rollup-plugin-node-builtins'

const config = Object.assign({}, prev)

config.output = {
  file: 'umd/skema.js',
  format: 'umd',
  name: 'Skema',
}

config.plugins = config.plugins.concat(builtins())

export default config
