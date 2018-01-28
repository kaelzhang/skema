import {
  shape
} from 'skema'

const User = shape({
  // A optional property
  id: 'number?',
  firstName: String,
  // Use 'string' is also OK.
  lastName: 'string'
})

const user = User.from({
  firstName: 'Steve',
  lastName: {
    toString: () => 'Jobs'
  }
})

user.firstName  // 'Steve'
user.lastName   // 'Jobs'

User.from({
  id: 1,
  firstName: 'Steve'
})
// throw Error
// - code: NOT_OPTIONAL
// - message: key 'lastName' is not optional
