import {useRoutePayload} from '@github-ui/react-core/use-route-payload'

export interface SomeRoutePayload {
  // Update this type to reflect the data you place in payload in Rails
  someField: string
}

export function SomeRoute() {
  const payload = useRoutePayload<SomeRoutePayload>()

  return (
    <>
      <h1 data-hpc>SomeRoute for test-ssr-react-app-package</h1>
      <article>{payload.someField}</article>
    </>
  )
}
