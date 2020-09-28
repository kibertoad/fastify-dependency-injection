const awilix = require('awilix')
const fp = require('fastify-plugin')

const diContainer = awilix.createContainer({
  injectionMode: awilix.InjectionMode.PROXY,
})

function resolveModuleValue(moduleBlueprint, lifetime) {
  if (moduleBlueprint.factory) {
    return awilix.asFunction(moduleBlueprint.factory, lifetime)
  }
  if (moduleBlueprint.value) {
    return awilix.asValue(moduleBlueprint.value)
  }
  if (!(moduleBlueprint instanceof Function)) {
    throw new Error(
      'One of "factory" or "value" blueprint values have to be provided, or blueprint has to be a class'
    )
  }
  return awilix.asClass(moduleBlueprint, lifetime)
}

function plugin(fastify, opts, next) {
  fastify.decorate('diContainer', diContainer)
  fastify.decorateRequest('diScope', null)

  const { modules, variables } = opts

  const requestModules = []
  // ToDo implement path resolution
  const loadedModules = modules

  if (loadedModules) {
    for (let i = 0; i < loadedModules.length; i++) {
      const loadedModule = loadedModules[i]
      if (!loadedModule.moduleId) {
        throw new Error(
          '"moduleId" field has to be set on blueprint. If blueprint is a class, make sure "moduleId" is static'
        )
      }

      switch (loadedModule.scope) {
        case 'app':
        case undefined:
          diContainer.register(
            loadedModule.moduleId,
            resolveModuleValue(loadedModule, awilix.Lifetime.SINGLETON)
          )
          break
        case 'request':
          requestModules.push(loadedModule)
          break
        case 'transient':
          diContainer.register(
            loadedModule.moduleId,
            resolveModuleValue(loadedModule, awilix.Lifetime.TRANSIENT)
          )
          break
        default:
          throw new Error(`Unsupported scope: ${loadedModule.scope}`)
      }
    }
  }

  const requestVariables = []
  const loadedVariables = variables

  if (loadedVariables) {
    for (let i = 0; i < loadedVariables.length; i++) {
      const loadedVariable = loadedVariables[i]
      if (!loadedVariable.moduleId) {
        throw new Error(
          '"moduleId" field has to be set on blueprint. If blueprint is a class, make sure "moduleId" is static'
        )
      }

      switch (loadedVariable.scope) {
        case 'app':
        case undefined:
          diContainer.register(
            loadedVariable.moduleId,
            resolveModuleValue(loadedVariable, awilix.Lifetime.SINGLETON)
          )
          break
        case 'request':
          requestVariables.push(loadedVariable)
          break
        case 'transient':
          diContainer.register(
            loadedVariable.moduleId,
            resolveModuleValue(loadedVariable, awilix.Lifetime.TRANSIENT)
          )
          break
        default:
          throw new Error(`Unsupported scope: ${loadedVariable.scope}`)
      }
    }
  }

  fastify.addHook('onRequest', (req, res, done) => {
    const diScope = diContainer.createScope()
    req.diScope = diScope

    for (let i = 0; i < requestModules.length; i++) {
      const requestModule = requestModules[i]
      diScope.register(
        requestModule.moduleId,
        resolveModuleValue(requestModule, awilix.Lifetime.SCOPED)
      )
    }

    for (let i = 0; i < requestVariables.length; i++) {
      const requestVariable = requestVariables[i]
      diScope.register(
        requestVariable.moduleId,
        resolveModuleValue(requestVariable, awilix.Lifetime.SCOPED)
      )
    }
    done()
  })

  next()
}

const fastifyDependencyInjectionPlugin = fp(plugin, {
  fastify: '3.x',
  name: 'fastify-dependency-injection',
})

module.exports = {
  diContainer,
  fastifyDependencyInjectionPlugin,
}
