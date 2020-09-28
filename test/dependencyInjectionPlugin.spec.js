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
      const maxUserNameVariableBlueprint2 = {
        moduleId: 'maxUserPassword',
        factory: async () => {
          return await Promise.resolve(20).then((result) => result)
        },
      }

      app = fastify({ logger: true })
      const endpoint = async (req, res) => {
        const userService = app.diContainer.resolve('userService')
        expect(userService.maxUserName).toEqual(10)

        const maxUserPassword = await req.diScope.resolve('maxUserPassword')
        expect(maxUserPassword).toEqual(20)
        res.send({
          status: 'OK',
        })
      }

      app.register(fastifyDependencyInjectionPlugin, {
        modules: [UserService, UserRepository],
        variables: [maxUserNameVariableBlueprint2, maxUserNameVariableBlueprint],
      })
      app.post('/', endpoint)
      await app.ready()

      const response = await app.inject().post('/').end()
      expect(response.statusCode).toEqual(200)
    })
  })
})
