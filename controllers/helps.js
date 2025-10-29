const helpsRouter = require('express').Router()
const Help = require('../models/help')

helpsRouter.get('/', async (request, response) => {
  const helps = await Help.find({})
  response.json(helps)
})

helpsRouter.post('/', async (request, response) => {
  const body = request.body

  const help = new Help({
    tittle: body.tittle,
    description: body.description,
    beans: body.beans,
  })
  const savedHelp = await help.save()
  response.status(201).json(savedHelp)
})

helpsRouter.delete('/:id', async (request, response) => {
  await Help.findByIdAndDelete(request.params.id)
  response.status(204).end()
})


module.exports = helpsRouter
