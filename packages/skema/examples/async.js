import {skema} from 'skema'

const s = skema.defaults({
  // Turn on async mode,
  // then the following properties will supports async functions:
  // - when
  // - default
  // - validate
  // - set
  async: true
})

const GENDERS = ['MALE', 'FEMALE', 'SECRET']

const User = s({
  nickName: {
    validate: name => {
      return new Promise((resolve, reject) => {
        checkUniqueFromRemoteServer(name, unique => {
          if (unique) {
            return resolve(true)
          }

          reject(new Error(`nickName "${name}" is already taken`))
        })
      })
    }
  },

  gender: {
    set: gender => {
      if (typeof gender === 'number') {
        gender = GENDERS[gender]
      }

      if (!~GENDERS.indexOf(gender)) {
        throw new Error(`invalid gender ${gender}`)
      }
    }
  }
})

;(async () => {

// Case 1
try {
  const user = await User.from({
    nickName: 'Steve',
    gender: 2
  })
  console.log(user)
} catch (e) {
  console.error(e.message)
  // nickName "Steve" is already taken
}

// Case 2
try {
  const user = await User.from({
    nickName: 'Kael',
    gender: 0
  })
  console.log(user)
  // {
  //   nickName: 'Kael',
  //   gender: 'MALE'
  // }
} catch (e) {
  console.error(e.message)
}

// Case: 3
User.from({
  nickName: 'Bob',
  gender: 'UNKNOWN'
}) // .from() returns a `Promise` if async: true
.catch(error => console.log(error.message))
// invalid gender UNKNOWN

})()
