import prev from './rollup.umd'
import uglify from 'rollup-plugin-uglify'
import { minify } from 'uglify-es'

const config = Object.assign({}, prev)

config.output = Object.assign({}, config.output, {
  file: 'umd/skema.min.js',
})

config.plugins = config.plugins.concat(uglify({}, minify))

export default config
