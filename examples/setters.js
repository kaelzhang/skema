// Suppose that we want to convert
// 0 -> 'MALE'
// 1 -> 'FEMALE'
// 2 -> 'SECRET'

import {type} from 'skema'
import {isNumber} from './multiple-validators'

const GENDERS = [
  'MALE',
  'FEMALE',
  'SECRET'
]

// 1
// skema check validators, then process setters
const Gender = type({
  validate: isNumber,
  set (v) {
    if (v in GENDERS) {
      return GENDERS[v]
    }

    // And we could also throw errors in setters
    // as we do in validators
    throw 'invalid gender'
  }
})

Gender.from('haha')
// throw Error
// - message: invalid value 'haha'
// - code: 'VALIDATION_FAILS'

Gender.from(1)
// 'FEMALE'

Gender.from(3)
// throw Error
// - message: 'invalid gender'
// - code: 'CUSTOM_ERROR'

// 2
// So we create our own Enum factory
export const Enum = (enums) => {
  return type({
    set (v) {
      if (v in enums) {
        return enums[v]
      }

      throw 'invalid enum'
    }
  })
}

const gender2 = Enum(GENDERS)


// 3
// Similar to validators, `set` could also be an array
const UserComment = type({
  set: [
    stripHTMLTags,
    comment => `comment: ${comment}`
  ]
})

UserComment.from('I seem <script>doEvil()</script>innocent')
// 'comment: I seem innocent'


// 4.
// Async setters
import {defaults} from 'skema'
const {
  type: asyncType
} = defaults({
  async: true
})

const SpanishTranslator = asyncType({
  set (v) {
    return new Promise((resolve) => {
      remoteGoogleTranslate(v, 'spanish', words => {
        resolve(words)
      })
    })
  }
})

SpanishTranslator.from('hello')
// hola
