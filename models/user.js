const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  passwordHash: String,
  helps: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Help'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User

//TEE:
//onko käyttäjätunnus tarpeeksi pitkä,
// koostuuko se sallituista merkeistä ja
// onko salasana tarpeeksi hyvä.