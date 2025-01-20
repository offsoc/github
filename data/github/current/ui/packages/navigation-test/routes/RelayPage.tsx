/* eslint eslint-comments/no-use: off */
import {graphql, type EntryPointComponent, usePreloadedQuery} from 'react-relay'
import type {RelayPageQuery} from './__generated__/RelayPageQuery.graphql'
import {Nav} from '@github-ui/navigation-test-components'
import {useLocation} from 'react-router-dom'

export interface RelayPagePayload {
  // Update this type to reflect the data you place in payload in Rails
  someField: string
  ssr: boolean
  title: string
}

export const RelayPage: EntryPointComponent<{relayPageQuery: RelayPageQuery}, Record<string, never>> = ({
  queries: {relayPageQuery},
}) => {
  const data = usePreloadedQuery<RelayPageQuery>(
    graphql`
      query RelayPageQuery {
        viewer {
          login
        }
      }
    `,
    relayPageQuery,
  )

  const {pathname} = useLocation()
  const kind = pathname.split('/').at(-1)
  const pageTitle = `NavigationTest#React-Relay ${kind?.toUpperCase()}`

  if (!data.viewer) {
    return null
  }

  return (
    <>
      <h1 data-hpc>{pageTitle}</h1>
      <label htmlFor="focus-element">Focus element </label>
      <input type="text" id="focus-element" defaultValue="focus element" data-react-autofocus />
      <pre data-testid="payload">{JSON.stringify({viewer: {login: data.viewer.login}})}</pre>
      <Nav />
    </>
  )
}
