import type {PagePayload} from '../routes/Page'

export function getPageRoutePayload(): PagePayload {
  return {
    someField: 'Payload for the navigation-test Page route',
    ssr: true,
    title: 'React App SSR',
  }
}
