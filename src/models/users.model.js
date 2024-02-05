const { default: mongoose } = require('mongoose')

const userSchema = new mongoose.Schema({
  nickname: {
    type: String,
    unique: true,
    sparse: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  uid: {
    type: String,
    required: true,
    unique: true,
  },
  lastLoginAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
  },
})

// passport
// userSchema.methods.comparePassword = function (plainPassword, cb) {
//   if (plainPassword === this.password) {
//     cb(null, true)
//   } else {
//     cb(null, false)
//   }
// }

const User = mongoose.model('users', userSchema)
module.exports = User
