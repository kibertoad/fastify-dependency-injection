import { FastifyPluginCallback } from 'fastify'

interface Container {
  resolve<T>(name: string | symbol): T
}

declare module 'fastify' {
  interface FastifyRequest {
    diScope: Container
  }

  interface FastifyInstance {
    diContainer: Container
  }
}

export type FastifyDependencyInjectionOptions = {
  modules: string | readonly string[] | readonly ModuleBlueprint[]
  variables: string | readonly string[] | readonly ModuleBlueprint[]
}

export interface ModuleBlueprint<T = any> {
  readonly moduleId: string
  readonly moduleInstanceId?: string
  readonly scope?: InjectionScope
  readonly priority?: number // higher wins
  readonly forClass?: Function
  readonly factory?: (() => T) | (() => Promise<T>)
  readonly value?: T
}

export class ResolvedModule<T extends Record<string, any>> {
  constructor(dependencies: T)
}

export type InjectionScope = 'app' | 'request' | 'transient'

export const fastifyDependencyInjectionPlugin: FastifyPluginCallback<NonNullable<
  FastifyDependencyInjectionOptions
>>

export default fastifyDependencyInjectionPlugin
