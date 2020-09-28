const fastify = require('fastify')

const { fastifyDependencyInjectionPlugin } = require('../index')

describe('dependencyInjectionPlugin', () => {
  let app
  afterEach(() => {
    return app.close()
  })

  describe('inject singleton', () => {
    it('injects correctly', async () => {
      class UserService {
        static moduleId = 'userService'

        constructor({ userRepository, maxUserName }) {
          this.userRepository = userRepository
          this.maxUserName = maxUserName
        }
      }

      class UserRepository {
        static moduleId = 'userRepository'
      }

      const maxUserNameVariableBlueprint = {
        moduleId: 'maxUserName',
        factory: () => {
          return 10
        },
      }

      app = fastify({ logger: true })
      const endpoint = (req, res) => {
        const userService = app.diContainer.resolve('userService')
        const maxUserName = userService.maxUserName
        expect(maxUserName).toEqual(10)
        res.send({
          status: 'OK',
        })
      }

      app.register(fastifyDependencyInjectionPlugin, {
        modules: [UserService, UserRepository],
        variables: [maxUserNameVariableBlueprint],
      })
      app.post('/', endpoint)
      await app.ready()

      const response = await app.inject().post('/').end()
      expect(response.statusCode).toEqual(200)
    })
  })
})
