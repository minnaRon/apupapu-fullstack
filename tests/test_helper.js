const Help = require('../models/help')

const initialHelps = [
  {
    tittle: 'Lumityöt',
    description: 'lapiolla',
    beans: 20,
  },
  {
    tittle: 'Pellillinen korvapuusteja',
    description: 'myös gluteenittomina',
    beans: 5,
  }
]

const nonExistingId = async () => {
  const help = new Help({ content: 'willremovethissoon' })
  await help.save()
  await help.deleteOne()

  return help._id.toString()
}

const helpsInDb = async () => {
  const helps = await Help.find({})
  return helps.map(help => help.toJSON())
}

module.exports = {
  initialHelps, nonExistingId, helpsInDb
}
