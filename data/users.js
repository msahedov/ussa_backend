const bcrypt = require('bcryptjs')

const users = [
  {
    name: 'Admin',
    phoneNumber: '61111110',
    password: bcrypt.hashSync('123456', 8),
    role: 'admin'
  },
  {
    name: 'Bedew',
    phoneNumber: '62657222',
    password: bcrypt.hashSync('123456', 8),
    role: 'partner'
  },
  {
    name: 'Akgaya',
    phoneNumber: '65575757',
    password: bcrypt.hashSync('123456', 8),
    role: 'partner'
  },
  {
    name: 'Aylymebel',
    phoneNumber: '63460066',
    password: bcrypt.hashSync('123456', 8),
    role: 'partner'
  },
  {
    name: 'Ugurdash sowda',
    phoneNumber: '61821049',
    password: bcrypt.hashSync('123456', 8),
    role: 'partner'
  },
  {
    name: 'Amanow Aman',
    phoneNumber: '61111112',
    password: bcrypt.hashSync('123456', 8),
    role: 'user'
  },
  {
    name: 'Myrat Myradow',
    phoneNumber: '61111113',
    password: bcrypt.hashSync('123456', 8),
    role: 'user'
  },
  {
    name: 'Serdar Serdarow',
    phoneNumber: '61111114',
    password: bcrypt.hashSync('123456', 8),
    role: 'user'
  }

]

module.exports = users
