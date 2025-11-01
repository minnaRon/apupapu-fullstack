const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
//helps
const Help = require('../models/help')
//users
const bcrypt = require('bcrypt')
const User = require('../models/user')

const api = supertest(app)

//helps
describe('when there is initially some helps saved', () => {
  beforeEach(async () => {
    await Help.deleteMany({})
    await Help.insertMany(helper.initialHelps)
  })

  test('helps are returned as json', async () => {
    await api
      .get('/api/helps')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all helps are returned', async () => {
    const response = await api.get('/api/helps')

    assert.strictEqual(response.body.length, helper.initialHelps.length)
  })

  test('a specific help is within the returned helps', async () => {
    const response = await api.get('/api/helps')

    const contents = response.body.map(e => e.task)
    assert(contents.includes('Lumityöt'))
  })

  describe('addition of a new help', () => {
    test('succeeds with valid data', async () => {
      const newhelp = {
        task: 'Lumityöt',
        beans: 20,
      }

      await api
        .post('/api/helps')
        .send(newhelp)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const helpsAtEnd = await helper.helpsInDb()
      assert.strictEqual(helpsAtEnd.length, helper.initialHelps.length + 1)

      const contents = helpsAtEnd.map(n => n.task)
      assert(contents.includes('Lumityöt'))
    })

    test('fails with status code 400 if data invalid', async () => {
      const newhelp = { task: '' }

      await api.post('/api/helps').send(newhelp).expect(400)

      const helpsAtEnd = await helper.helpsInDb()

      assert.strictEqual(helpsAtEnd.length, helper.initialHelps.length)
    })
  })

  describe('deletion of a help', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const helpsAtStart = await helper.helpsInDb()
      const helpToDelete = helpsAtStart[0]

      await api.delete(`/api/helps/${helpToDelete.id}`).expect(204)

      const helpsAtEnd = await helper.helpsInDb()

      const contents = helpsAtEnd.map(n => n.task)
      assert(!contents.includes(helpToDelete.task))

      assert.strictEqual(helpsAtEnd.length, helper.initialHelps.length - 1)
    })
  })
})

//users
describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    assert(usernames.includes(newUser.username))
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    assert(result.body.error.includes('expected `username` to be unique'))

    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

after(async () => {
  await mongoose.connection.close()
})
