### Services

## What are Services?

We use a service pattern with our components that is similar to Angular's services. From their docs:

> A service is a broad category encompassing any value, function, or feature that an application needs. A service is typically a class with a narrow, well-defined purpose. It should do something specific and do it well.
>
> Ideally, a component's job is to enable only the user experience. A component should present properties and methods for data binding to mediate between the view and the application logic. The view is what the template renders and the application logic is what includes the notion of a model.
>
> A component should use services for tasks that don't involve the view or application logic. Services are good for tasks such as fetching data from the server, validating user input, or logging directly to the console. By defining such processing tasks in an injectable service class, you make those tasks available to any component. You can also make your application more adaptable by injecting different providers of the same kind of service, as appropriate in different circumstances.

## Benefits

We have multiple benefits with the service pattern:

- Having services allows us to easily define a single source of truth for our models. All actions to get/mutate the models go through the same service
- Services are very easy to mock so that we can easily test components because consumers are dependent on the interface, but not the service itself
- Provide a clear separation between components (UI) and complex application logic so components can be simpler

## How it Works

We have a [service store](../common/services/services.ts) that all services must be registered with.

Registering services is done through the [service-regstrations](../common/services/service-registrations.ts) file. After creating a new service it just needs to be added to the list of registered services.

A new service needs to have some small peices for this all to work together:

- Extend the `ServiceBase` class and implement the `IService` interface
- declare a static `serviceId` property
- create an interface for all the public properties/methods
- add the service to the array in the [service-registrations](../common/services/service-registrations.ts)

Take the example below:

```ts
import type {IService} from './services'
import {ServiceBase} from './services'

export interface IFooService extends IService {
  getFoo: () => string
  setFoo: (arg: string) => void
}

export class FooService extends ServiceBase implements IFooService {
  public static override readonly serviceId = 'IFooService'
  private foo = ''

  public getFoo(): string {
    return this.foo
  }

  public setFoo(arg: string): string {
    this.foo = arg
  }
}
```

This can now be called in any component without adding it as a dependency:

```ts
import {Services} from './services'
import type {IFooService} from './services/foo'

function FooComponent() {
  const fooService = Services.get<IFooService>('IFooService')

  return <div>fooService.getFoo()</div>
}
```

For testing purposes we can easily create a mock as follows:

```ts
import type {IMockService} from './services'
import type {IFooService} from './services/foo'

export class MockOrgUsageService implements IFooService, IMockService {
  public static override readonly serviceId = 'IFooService'
  public readonly isMock = true

  public getFoo(): string {
    return 'my test value'
  }

  public setFoo(arg: string): string {
    // do nothing
  }
}
```
