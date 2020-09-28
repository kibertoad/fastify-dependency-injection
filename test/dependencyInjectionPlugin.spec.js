const fastify = require("fastify");

const { fastifyDependencyInjectionPlugin } = require("../index");

describe("dependencyInjectionPlugin", () => {
  let app;
  afterEach(() => {
    return app.close();
  });

  describe("inject singleton", () => {
    it("injects correctly", async () => {
      class UserService {
        constructor({ userRepository, maxUserName }) {
          this.userRepository = userRepository;
          this.maxUserName = maxUserName;
        }

        static blueprint = {
          forClass: UserService,
          moduleId: "userService",
          requiredModules: ["userRepository"],
          requiredVariables: ["maxUserName"],
        };
      }

      class UserRepository {
        static blueprint = {
          forClass: UserRepository,
          moduleId: "userRepository",
        };
      }

      const maxUserNameVariableBlueprint = {
        moduleId: "maxUserName",
        factory: () => {
          return 10;
        },
      };

      app = fastify({ logger: true });
      const endpoint = (req, res) => {
        const userService = app.diContainer.resolve("userService");
        const maxUserName = userService.maxUserName;
        expect(maxUserName).toEqual(10);
        res.send({
          status: "OK",
        });
      };

      app.register(fastifyDependencyInjectionPlugin, {
        modules: [UserService.blueprint, UserRepository.blueprint],
        variables: [maxUserNameVariableBlueprint],
      });
      app.post("/", endpoint);
      await app.ready();

      const response = await app.inject().post("/").end();
      expect(response.statusCode).toEqual(200);
    });
  });
});
