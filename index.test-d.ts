import fastify, { FastifyInstance, RouteHandlerMethod } from "fastify";
import fastifyDependencyInjectionPlugin, {
  ModuleBlueprint,
  ResolvedModule,
} from "./index";

class UserService extends ResolvedModule<{
  maxUsername: number;
}> {
  static readonly blueprint: ModuleBlueprint<UserService> = {
    moduleId: "userService",
    forClass: UserService
  };
}

const maxUserNameVariableBlueprint: ModuleBlueprint<number> = {
  moduleId: "maxUserName",
  factory: () => {
    return 10;
  },
};

const asyncMaxUserNameVariableBlueprint: ModuleBlueprint<number> = {
  moduleId: "maxUserName",
  factory: () => {
    return Promise.resolve(10);
  },
};

const app: FastifyInstance = fastify();

app.register(fastifyDependencyInjectionPlugin, {
  modules: [UserService.blueprint],
  variables: [maxUserNameVariableBlueprint],
});
