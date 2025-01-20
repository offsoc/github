import type React from 'react'
import {QueryClientProvider} from '@tanstack/react-query'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'

import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {PageDataContextProvider} from '@github-ui/pull-request-page-data-tooling/page-data-context'
import queryClient from '@github-ui/pull-request-page-data-tooling/query-client'
import type {CommitsRoutePayload} from './routes/Commits'

/**
 * The App component is used to render content which should be present on _all_ routes within this app
 */
export function App(props: {children?: React.ReactNode}) {
  const {urls} = useRoutePayload<CommitsRoutePayload>()

  return (
    <QueryClientProvider client={queryClient}>
      <PageDataContextProvider basePageDataUrl={urls.conversation}>{props.children}</PageDataContextProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
