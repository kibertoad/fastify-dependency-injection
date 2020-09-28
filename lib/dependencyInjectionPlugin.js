const awilix = require("awilix");
const fp = require("fastify-plugin");

const diContainer = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
});

function resolveModuleValue(moduleBlueprint, lifetime) {
  if (moduleBlueprint.factory) {
    return awilix.asFunction(moduleBlueprint.factory, lifetime);
  }
  if (moduleBlueprint.value) {
    return awilix.asValue(moduleBlueprint.value);
  }

  if (!moduleBlueprint.forClass) {
    throw new Error(
      'One of "forClass", "factory" or "value" blueprint values have to be provided'
    );
  }
  return awilix.asClass(moduleBlueprint.forClass, lifetime);
}

function plugin(fastify, opts, next) {
  fastify.decorate("diContainer", diContainer);
  fastify.decorateRequest("diScope", null);

  const { modules, variables } = opts;

  const appSingletonModules = [];
  const requestModules = [];
  const transientModules = [];

  // ToDo implement path resolution
  const loadedModules = modules;

  if (loadedModules) {
    for (let i = 0; i < loadedModules.length; i++) {
      const loadedModule = loadedModules[i];
      switch (loadedModule.scope) {
        case "app":
        case undefined:
          appSingletonModules.push(loadedModule);
          diContainer.register(
            loadedModule.moduleId,
            resolveModuleValue(loadedModule, awilix.Lifetime.SINGLETON)
          );
          break;
        case "request":
          requestModules.push(loadedModule);
          break;
        default:
          throw new Error(`Unsupported scope: ${loadedModule.scope}`);
      }
    }
  }

  const appSingletonVariables = [];
  const requestVariables = [];
  const transientVariables = [];

  const loadedVariables = variables;

  if (loadedVariables) {
    for (let i = 0; i < loadedVariables.length; i++) {
      const loadedVariable = loadedVariables[i];
      switch (loadedVariable.scope) {
        case "app":
        case undefined:
          appSingletonVariables.push(loadedVariable);
          diContainer.register(
            loadedVariable.moduleId,
            resolveModuleValue(loadedVariable, awilix.Lifetime.SINGLETON)
          );
          break;
        case "request":
          requestVariables.push(loadedVariable);
          break;
        default:
          throw new Error(`Unsupported scope: ${loadedVariable.scope}`);
      }
    }
  }

  fastify.addHook("onRequest", (req, res, done) => {
    req.diScope = diContainer.createScope();
    done();
  });

  next();
}

const fastifyDependencyInjectionPlugin = fp(plugin, {
  fastify: "3.x",
  name: "fastify-dependency-injection",
});

module.exports = {
  diContainer,
  fastifyDependencyInjectionPlugin,
};