const helpsRouter = require('express').Router()
const Help = require('../models/help')

helpsRouter.get('/', async (request, response) => {
  const helps = await Help.find({}).populate('user', { username: 1, name: 1 })
  response.json(helps)
})

helpsRouter.post('/', async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'token not valid' })
  }
  const user = request.user
  const help = new Help({
    ...request.body, user: user.id
  })
  const savedHelp = await help.save()
  user.helps = user.helps.concat(savedHelp._id)
  await user.save()
  const helpWithUsername = await Help.findById(savedHelp._id).populate('user', { username: 1, name: 1 })
  response.status(201).json(helpWithUsername)
})

helpsRouter.put('/:id', async (request, response) => {
  const helpToUpdate = await Help.findById(request.params.id)
  if(!helpToUpdate) {
    return response.status(404).json({ error: 'resource missing' })
  }
  Object.assign(helpToUpdate, request.body)
  await helpToUpdate.save()
  const updatedHelp = await Help.findById(helpToUpdate._id).populate('user', { username: 1, name: 1 })
  return response.json(updatedHelp)
})

helpsRouter.delete('/:id', async (request, response) => {
  const helpToDelete = await Help.findById(request.params.id)
  if (!helpToDelete ) {
    return response.status(204).end()
  }
  if ( helpToDelete.user && helpToDelete.user.toString() !== request.user.id.toString() ) {
    return response.status(401).json({
      error: 'only the creator can delete this help'
    })
  }
  await Help.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = helpsRouter
