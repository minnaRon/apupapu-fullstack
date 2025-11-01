const mongoose = require('mongoose')

const helpSchema = new mongoose.Schema({
  tittle: {
    type: String,
    required: true,
    minlength: 5,
  },
  description: String,
  beans: {
    type: Number,
    required: true,
    min: [0, 'Papujen määrä puuttuu vielä']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

helpSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Help', helpSchema)
