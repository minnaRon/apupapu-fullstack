const router = require('express').Router()
const Help = require('../models/help')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
  await Help.deleteMany({})
  await User.deleteMany({})

  response.status(204).end()
})

module.exports = router
