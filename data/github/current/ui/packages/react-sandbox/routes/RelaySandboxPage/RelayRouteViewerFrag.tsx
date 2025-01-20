import {useFragment} from 'react-relay'
import {graphql} from 'relay-runtime'
import type {RelayRouteViewerFragViewer$key} from './__generated__/RelayRouteViewerFragViewer.graphql'
import {ViewerLoginAndType} from './ViewerLoginAndType'
import type {RelaySandboxPageQuery$data} from './__generated__/RelaySandboxPageQuery.graphql'
import {memo} from 'react'

export const RelayRouteViewerFrag = memo(function RelayRouteViewerFrag({
  preloadedQueryRef,
}: {
  preloadedQueryRef: RelaySandboxPageQuery$data
}) {
  const {
    viewer: {login},
  } = useFragment<RelayRouteViewerFragViewer$key>(
    graphql`
      fragment RelayRouteViewerFragViewer on Query {
        viewer {
          login
        }
      }
    `,
    preloadedQueryRef,
  )
  return <ViewerLoginAndType type="Fragment">{login}</ViewerLoginAndType>
})
