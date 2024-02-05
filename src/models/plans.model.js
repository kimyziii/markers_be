const { default: mongoose } = require('mongoose')

const plansSchema = new mongoose.Schema({
  title: String,
  createdById: String,
  createdAt: Date,
  data: String,
})

const Plans = mongoose.model('plans', plansSchema)
module.exports = Plans
