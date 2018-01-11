import {skema} from 'skema'

const User = skema({
  name: String,
  id: Number
})

const UserList = skema([User])

const list = UserList.from([
  {
    name: 'Steve',
    id: '1'
  },
  {
    name: 'Tim',
    id: 2
  }
])
// [{name: 'Steve', id: 1}, {name: 'Tim', id: 2}]


import {arrayOf} from 'skema'

const UserList2 = arrayOf(User)
// The same effect as `UserList`

import 
