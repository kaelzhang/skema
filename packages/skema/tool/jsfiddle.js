// Used for JsFiddle
// https://github.com/kaelzhang/skema
////////////////////////////////////////////////////////

function _log (className) {
	const div = document.createElement('div')
  div.className = className
    ? 'log ' + className
    : 'log'

  const contents = []
  const length = arguments.length
  let i = 1

  while (i < length) {
  	contents.push(
    	JSON.stringify(arguments[i ++], null, 2)
    )
  }

  div.textContent = contents.join(' ')

  document.body.appendChild(div)
}

function success () {
  _log.apply(
    null,
    ['success'].concat(
      Array.prototype.slice.call(arguments)
    )
  )
}

function fail () {
  _log.apply(
    null,
    ['fail'].concat(
      Array.prototype.slice.call(arguments)
    )
  )
}

function log () {
  _log.apply(
    null,
    ['info'].concat(
      Array.prototype.slice.call(arguments)
    )
  )
}

function throws (name, func) {
  if (typeof name === 'function') {
    func = name
    name = ''
  }

  try {
    func()
  } catch (e) {
    name
      ? fail(name, e.message, e)
      : fail(e.message, e)
    return
  }
}

function addCSS (css) {
  const style = document.createElement('style')
  style.type = 'text/css'

  if (style.styleSheet){
    style.styleSheet.cssText = css
  } else {
    style.appendChild(document.createTextNode(css))
  }

  const head = document.head || document.getElementByTagName('head')[0]
  head.appendChild(style)
}

addCSS(`
body {
  margin: 1px;
  padding: 20px;
  white-space: pre;
  font: 12px monospace;
  line-height: 18px;
  background: transparent;
}

.log {
  min-height: 18px;
  color: #f7f7f8;
}

.success {
  color: #6ce890;
}

.fail {
  color: #ed6e55;
}
`)
