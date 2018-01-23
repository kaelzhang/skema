import {skema} from 'skema'

// 3. Compose a collection of type definitions
const C = skema({
  // 1. Type definition for one property
  a: Number,
  // 2. Extends the basic type
  b: {
    type: String,
    validate: v => v.length > 6
  }
})

// 4. To compose a more complex one
const D = skema({
  c: C,
  d: String
})

const foo = D.from({
  c: {
    a: '1',         // will be converted to `1`
    b: '12345678'   // it is good
  },
  d: 1              // will be converted to `'1'`
})
// {
//   c: {
//     a: 1,
//     b: '12345678'
//   },
//   d: '1'
// }

const bar = D.from({
  c: {
    a: 1,
    b: 123
  },
  d: 'a'
})
// Will throw, because 
