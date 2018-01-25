import config from './rollup'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

config.output = {
  file: 'umd/skema.min.js',
  format: 'umd',
  name: 'Skema',
}

config.plugins.push(uglify({}, minify))

export default config
