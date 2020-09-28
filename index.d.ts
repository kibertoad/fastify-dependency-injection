import { FastifyPluginCallback } from "fastify";

/**
 * Optional resolve options.
 */
interface ResolveOptions {
  /**
   * If `true` and `resolve` cannot find the requested dependency,
   * returns `undefined` rather than throwing an error.
   */
  allowUnregistered?: boolean;
}

interface Container {
  resolve<T>(name: string | symbol, resolveOptions?: ResolveOptions): T;
}

declare module "fastify" {
  interface FastifyRequest {
    diScope: Container;
  }

  interface FastifyInstance {
    diContainer: Container;
  }
}

export type FastifyDependencyInjectionOptions = {
  modules: string | readonly string[] | readonly ModuleBlueprint[];
  variables: string | readonly string[] | readonly ModuleBlueprint[];
};

export interface ModuleBlueprint<T = any> {
  readonly moduleId: string;
  readonly moduleInstanceId?: string;
  readonly scope?: InjectionScope;
  readonly priority?: number; // higher wins
  readonly requiredModules?: readonly ModuleBlueprint[] | readonly string[];
  readonly requiredVariables?: readonly ModuleBlueprint[] | readonly string[];
  readonly forClass?: Function;
  readonly factory?: () => T;
  readonly value?: T;
}

export class ResolvedModule<T extends Record<string, any>> {
  constructor(dependencies: T);
}

export type InjectionScope = "app" | "request" | "always";

export const fastifyDependencyInjectionPlugin: FastifyPluginCallback<NonNullable<
  FastifyDependencyInjectionOptions
>>;

export default fastifyDependencyInjectionPlugin;
