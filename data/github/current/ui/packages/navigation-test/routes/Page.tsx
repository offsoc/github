import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Nav} from '@github-ui/navigation-test-components'

export interface PagePayload {
  // Update this type to reflect the data you place in payload in Rails
  someField: string
  ssr: boolean
  title: string
}

export function Page() {
  const payload = useRoutePayload<PagePayload>()
  const pageTitle = payload ? `NavigationTest#${payload.title}` : ''

  return !payload ? (
    <>Page Loading...</>
  ) : (
    <>
      <h1 data-hpc>{pageTitle}</h1>
      <label htmlFor="focus-element">Focus element </label>
      <input type="text" id="focus-element" defaultValue="focus element" data-react-autofocus />
      <pre data-testid="payload">{JSON.stringify(payload)}</pre>
      <Nav />
    </>
  )
}
