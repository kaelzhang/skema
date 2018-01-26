// Used for JsFiddle
// https://github.com/kaelzhang/skema
////////////////////////////////////////////////////////

function log (className) {
	const div = document.createElement('div')
  div.className = className
    ? className + ' log'
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
  log.apply(
    null,
    ['success'].concat(
      Array.prototype.slice.call(arguments)
    )
  )
}

function fail () {
  log.apply(
    null,
    ['fail'].concat(
      Array.prototype.slice.call(arguments)
    )
  )
}

function throws (name, func) {
  try {
    func()
  } catch (e) {
    fail(name, e.message, e)
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
}

.success {
  color: #6ce890;
}

.fail {
  color: #ed6e55;
}
`)
