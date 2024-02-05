const passport = require('passport')
const User = require('../models/users.model')
const LocalStrategy = require('passport-local').Strategy

passport.serializeUser((user, done) => {
  console.log(`serialize user: ${JSON.stringify(user)}`)
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  console.log(`descrialize user:::::::`)
  console.log(id)
  User.findById(id).then((user) => done(null, user))
})

passport.use(
  'local',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        await User.findOne({ email: email }).then((user, err) => {
          if (err) return done(err)
          if (!user)
            return done(null, false, {
              message: '등록되지 않은 이메일입니다.',
            })
          user.comparePassword(password, (err, isMatch) => {
            if (err) return done(err)
            if (isMatch) return done(null, user)
            return done(null, false, {
              message: '비밀번호를 확인해 주세요.',
            })
          })
        })
      } catch (err) {
        return done(err)
      }
    },
  ),
)
