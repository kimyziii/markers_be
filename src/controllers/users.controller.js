const userModel = require('../models/users.model')

async function createUser(req, res, next) {
  console.log(req.body)
  try {
    const createdUser = await userModel.create(req.body)
    res.status(201).json(createdUser)
    return
  } catch (error) {
    console.log(error.message)
    res.send({ message: `${error.message}` })
    next()
  }
}

module.exports = {
  createUser,
}
