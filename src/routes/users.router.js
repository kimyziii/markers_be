const express = require('express')
const usersController = require('../controllers/users.controller')

const usersRouter = express.Router()
usersRouter.post('/', usersController.createUser)

module.exports = usersRouter
