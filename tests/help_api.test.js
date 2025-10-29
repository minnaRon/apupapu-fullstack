const assert = require('node:assert')
const { test, after, beforeEach, describe } = require('node:test')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const Help = require('../models/help')

const api = supertest(app)

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

    const contents = response.body.map(e => e.tittle)
    assert(contents.includes('Lumityöt'))
  })

  describe('addition of a new help', () => {
    test('succeeds with valid data', async () => {
      const newhelp = {
        tittle: 'Lumityöt',
        beans: 20,
      }

      await api
        .post('/api/helps')
        .send(newhelp)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const helpsAtEnd = await helper.helpsInDb()
      assert.strictEqual(helpsAtEnd.length, helper.initialHelps.length + 1)

      const contents = helpsAtEnd.map(n => n.tittle)
      assert(contents.includes('Lumityöt'))
    })

    test('fails with status code 400 if data invalid', async () => {
      const newhelp = { tittle: '' }

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

      const contents = helpsAtEnd.map(n => n.tittle)
      assert(!contents.includes(helpToDelete.tittle))

      assert.strictEqual(helpsAtEnd.length, helper.initialHelps.length - 1)
    })
  })
})

after(async () => {
  await mongoose.connection.close()
})
