export abstract class Services {
  private static container: {[key: string]: ICachedService | undefined} = {}

  public static add = (key: string, serviceFactory: ServiceFactory, override = false): void => {
    if (!key) {
      throw new Error('key is required for service registration')
    }

    if (!serviceFactory) {
      throw new Error('serviceFactory is required for service registration')
    }

    if (Services.container[key]) {
      // service already exists

      const current = Services.get(key)
      const replacement = getService(serviceFactory)
      const currentIsMock = isMockService(current)
      const replacementIsMock = isMockService(replacement)

      // container contains real service replaced by mock service: replace
      if ((replacementIsMock && !currentIsMock) || override) {
        Services.container[key] = {service: replacement, factory: serviceFactory}
        return
      }

      // container contains real service replaced by real service: error
      if (!replacementIsMock && !currentIsMock && !override) {
        throw new Error(`Service '${key}' already exists`)
      }
    }
    this.container[key] = {service: undefined, factory: serviceFactory}
  }

  public static get = <T extends IService>(key: string): T => {
    const cachedService = Services.container[key]
    if (cachedService) {
      if (!cachedService.service) {
        cachedService.service = getService(cachedService.factory)
      }
      return cachedService.service as T
    }

    throw new Error(`Service "${key}" not found - make sure it is registered in service-registrations`)
  }

  public static instantiated = (key: string): boolean => {
    const cachedService = Services.container[key]
    return !!cachedService && !!cachedService.service
  }

  public static registered = (key: string): boolean => {
    const cachedService = Services.container[key]
    return !!cachedService
  }
}

export type ServiceFactory = (new () => IService) | (() => IService)

export interface IService {}

export abstract class ServiceBase implements IService {
  public static serviceId: string

  public static serviceFactory: ServiceFactory

  public static registerService = (serviceId: string, serviceFactory: ServiceFactory): void => {
    Services.add(serviceId, serviceFactory)
  }
}

interface ICachedService {
  service?: IService
  factory: ServiceFactory
}

export interface IMockService extends IService {
  isMock: boolean
}

export abstract class MockServiceBase extends ServiceBase implements IMockService {
  public get isMock(): boolean {
    return true
  }

  public static override registerService = (serviceId: string, serviceFactory: ServiceFactory): void => {
    super.registerService(serviceId, serviceFactory)
  }
}

const isMockService = (service: IService): service is IMockService => {
  return (service as IMockService).isMock === true
}

const getService = (factory: ServiceFactory): IService => {
  let service: IService
  try {
    service = new (factory as new () => IService)()
  } catch (e) {
    service = (factory as () => IService)()
  }

  return service
}
