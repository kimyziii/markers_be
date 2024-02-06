const express = require('express')
const { default: mongoose } = require('mongoose')
const dotenv = require('dotenv')
const cors = require('cors')
const passport = require('passport')
const session = require('express-session')
const cookieSession = require('cookie-session')
const cookieParser = require('cookie-parser')
const plansModel = require('./models/plans.model')
const usersModel = require('./models/users.model')

const app = express()
dotenv.config({ path: './.env' })

app.use(
  cookieSession({
    name: 'markers-cookie-session',
    keys: [process.env.COOKIE_KEY],
    maxAge: 60 * 60 * 24,
  }),
)

const PORT = 4000

app.use(function (request, response, next) {
  if (request.session && !request.session.regenerate) {
    request.session.regenerate = (cb) => {
      cb()
    }
  }
  if (request.session && !request.session.save) {
    request.session.save = (cb) => {
      cb()
    }
  }
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use(
  session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: process.env.FE_URL,
      // httpOnly: true,
      sameSite: 'none',
      secure: false,
    },
  }),
)

app.use(
  cors({
    origin: process.env.FE_URL,
    credentials: true,
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 200,
  }),
)

app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PASSWORD}@markers.9718z2h.mongodb.net/?retryWrites=true&w=majority`,
  )
  .then(() => {
    console.log(`mongoDB connected.`)
  })
  .catch((e) => {
    console.log(e)
  })

// 정적 파일 제공하기
// app.use('/static', express.static(path.join(__dirname, 'public')))

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})

app.get('/plans/:mid', async (req, res) => {
  console.log('>>>>>>>>>>>>>>>> getAllPlans')
  console.log(req.params)

  try {
    const allPlans = await plansModel.find({ createdById: req.params.mid })
    res.status(200).json(allPlans)
    console.log(allPlans)
  } catch (error) {
    res.send({ message: error.message })
  }
})

app.post('/plans', async (req, res) => {
  console.log('>>>>>>>>>>>>>> /plans')
  console.log(req.body)

  try {
    const createdPlan = await plansModel.create(req.body)
    console.log(createdPlan)
    res.status(201).json({ message: 'success', id: createdPlan._id })
  } catch (err) {
    console.log(err)
    res.send({ message: err.message })
  }
})

app.get('/plan/:planId', async (req, res) => {
  console.log('>>>>>>>>>>>>>> get specific plan')
  console.log(req.params)
  try {
    const selectedPlan = await plansModel.findById(req.params.planId)
    const createdByName = await usersModel.findById(selectedPlan.createdById)
    const returnObj = {
      ...selectedPlan._doc,
      createdByName: createdByName.nickname,
    }

    console.log(returnObj)
    res.status(200).json(returnObj)
  } catch (error) {
    console.log(error.message)
    res.send({ message: error.message })
  }
})

app.delete('/plan/:planId', async (req, res) => {
  try {
    const deletedPlan = await plansModel.deleteOne({ _id: req.params.planId })
    console.log(deletedPlan)
    res.status(200).json(deletedPlan)
  } catch (error) {
    console.log(error.message)
    res.send({ message: error.message })
  }
})

app.post('/signup', async (req, res) => {
  console.log('>>>>>>>>>>>>>>> signup')
  try {
    const createdUser = await usersModel.create(req.body)
    res.status(201).json(createdUser)
  } catch (error) {
    console.log(error)
    res.send({ message: error.message })
  }
})

app.post('/login', async (req, res) => {
  console.log('>>>>>>>>>>>>>>> login')
  console.log(req.body)
  try {
    const updatedUser = await usersModel.findOne({ uid: req.body.uid })
    const targetId = updatedUser._id
    await usersModel.updateOne(
      { _id: targetId },
      { lastLoginAt: req.body.lastLoginAt },
    )
    res.status(200).json(updatedUser)
  } catch (error) {
    res.json({ message: error.message })
  }
})

app.post('/login/sns', async (req, res) => {
  console.log('>>>>>>>>>>>>>>>>>> sns login')
  try {
    const logined = await usersModel.findOne({ email: req.body.email })
    if (logined) {
      const targetId = logined._id
      await usersModel.updateOne(
        { _id: targetId },
        { lastLoginAt: req.body.lastLoginAt },
      )
      res.status(200).json(logined)
    } else {
      const createdUser = await usersModel.create(req.body)
      res.status(201).json(createdUser)
    }
  } catch (err) {
    console.log(err.message)
    res.json({ message: err.message })
  }
})

app.patch('/user/:mid', async (req, res) => {
  console.log('>>>>>>>>>>>>> user update')
  console.log(req.params.mid)
  try {
    const targetUser = await usersModel.findOne({ nickname: req.body.nickname })

    if (targetUser) {
      res.status(409).json({ message: 'Duplicate nickname' })
    } else {
      await usersModel.findByIdAndUpdate(req.params.mid, {
        nickname: req.body.nickname,
      })
      res.status(200).json({ message: 'Nickname updated successfully' })
    }
  } catch (err) {
    console.log(err.message)
    res.json({ message: err.message })
  }
})
