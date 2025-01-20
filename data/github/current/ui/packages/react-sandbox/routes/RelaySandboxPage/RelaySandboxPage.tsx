import {graphql, usePreloadedQuery, type EntryPointComponent} from 'react-relay'
import {SandboxLayout} from '../../SandboxLayout'
import type {RelaySandboxPageQuery} from './__generated__/RelaySandboxPageQuery.graphql'
import {RelayRouteLazyLoadedQuery} from './RelayRouteLazyLoadedQuery'
import {RelayRouteViewerFrag} from './RelayRouteViewerFrag'
import {ViewerLoginAndType} from './ViewerLoginAndType'

export const RelaySandboxPage: EntryPointComponent<
  {relaySandboxPage: RelaySandboxPageQuery},
  Record<string, never>
> = ({queries: {relaySandboxPage}}) => {
  const data = usePreloadedQuery<RelaySandboxPageQuery>(
    graphql`
      query RelaySandboxPageQuery @preloadable {
        viewer {
          login
        }
        ...RelayRouteViewerFragViewer
      }
    `,
    relaySandboxPage,
  )

  return (
    <SandboxLayout>
      <h1 data-hpc>Relay route</h1>
      <section>
        <ViewerLoginAndType type="Preloaded">{data.viewer.login}</ViewerLoginAndType>
      </section>
      <section>
        <RelayRouteViewerFrag preloadedQueryRef={data} />
      </section>
      <section>
        <RelayRouteLazyLoadedQuery />
      </section>
    </SandboxLayout>
  )
}
