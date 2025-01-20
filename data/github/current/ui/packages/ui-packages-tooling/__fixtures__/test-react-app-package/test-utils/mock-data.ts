import type {SomeRoutePayload} from '../routes/SomeRoute'

export function getSomeRouteRoutePayload(): SomeRoutePayload {
  return {
    someField: 'Payload for the test-react-app-package SomeRoute route',
  }
}
