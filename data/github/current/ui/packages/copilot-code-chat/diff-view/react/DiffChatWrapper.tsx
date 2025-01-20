import {assertDataPresent} from '@github-ui/assert-data-present'
import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {ErrorBoundary} from '@github-ui/react-core/error-boundary'
import {Suspense, type PropsWithChildren} from 'react'
import {graphql, useLazyLoadQuery} from 'react-relay'
import {
  useFileDiffReference,
  useFileDiffReferenceWithEntryProvided,
  type CopilotChatFileDiffReferenceData,
} from '../../use-file-diff-reference'
import type {
  DiffChatWrapper_ComparisonQuery,
  DiffChatWrapper_ComparisonQuery$variables,
} from './__generated__/DiffChatWrapper_ComparisonQuery.graphql'
import type {
  DiffChatWrapper_DiffEntryQuery,
  DiffChatWrapper_DiffEntryQuery$variables,
} from './__generated__/DiffChatWrapper_DiffEntryQuery.graphql'
import type {DiffChatWrapper_ViewerQuery} from './__generated__/DiffChatWrapper_ViewerQuery.graphql'

const WrapperViewerQuery = graphql`
  query DiffChatWrapper_ViewerQuery {
    viewer {
      isCopilotDotcomChatEnabled
    }
  }
`

const WrapperComparisonQuery = graphql`
  query DiffChatWrapper_ComparisonQuery($pullRequestId: ID!, $startOid: String!, $endOid: String!) {
    pullRequest: node(id: $pullRequestId) {
      ... on PullRequest {
        comparison(startOid: $startOid, endOid: $endOid) {
          ...useFileDiffReference_Comparison
        }
      }
    }
  }
`

const WrapperDiffEntryQuery = graphql`
  query DiffChatWrapper_DiffEntryQuery($diffEntryId: ID!) {
    diffEntry: node(id: $diffEntryId) {
      ... on PullRequestDiffEntry {
        ...useFileDiffReference_DiffEntry
      }
    }
  }
`
// check access first, before loading PR info
// this is slightly waterfall-ey but once the cache is warmed it shouldn't matter
export const CopilotCodeChatAccessLoader: React.FC<PropsWithChildren> = ({children}) => {
  const {viewer} = useLazyLoadQuery<DiffChatWrapper_ViewerQuery>(WrapperViewerQuery, {})
  if (!viewer.isCopilotDotcomChatEnabled) return null

  return <>{children}</>
}

// load PR info, build a FileDiffReference, and render!
const CopilotCodeChatReferenceLoader: React.FC<DiffChatLoaderProps<BaseDiffChatWrapperProps>> = ({
  Component,
  componentProps,
  queryVariables,
}) => {
  const {pullRequest} = useLazyLoadQuery<DiffChatWrapper_ComparisonQuery>(WrapperComparisonQuery, queryVariables)
  const {diffEntry} = useLazyLoadQuery<DiffChatWrapper_DiffEntryQuery>(WrapperDiffEntryQuery, queryVariables)
  assertDataPresent(pullRequest?.comparison)
  assertDataPresent(diffEntry)

  const fileDiffReference = useFileDiffReference(pullRequest.comparison, diffEntry)
  return fileDiffReference ? <Component fileDiffReference={fileDiffReference} {...componentProps} /> : null
}

// load PR info, build a FileDiffReference from provided data, and render!
const CopilotCodeChatComparisonLoader: React.FC<DiffChatComparisonLoaderProps<BaseDiffChatWrapperProps>> = ({
  Component,
  componentProps,
  referenceData,
  queryVariables,
}) => {
  const {pullRequest} = useLazyLoadQuery<DiffChatWrapper_ComparisonQuery>(WrapperComparisonQuery, queryVariables)
  assertDataPresent(pullRequest?.comparison)

  const fileDiffReference = useFileDiffReferenceWithEntryProvided(pullRequest?.comparison, referenceData)
  return fileDiffReference ? <Component fileDiffReference={fileDiffReference} {...componentProps} /> : null
}

// prettier-ignore
// it just formats this terribly and it's easier to read like this
export type DiffChatWrapperQueryVariables =
  DiffChatWrapper_ComparisonQuery$variables &
  DiffChatWrapper_DiffEntryQuery$variables

interface BaseDiffChatWrapperProps {
  errorFallback?: React.ReactNode
  suspenseFallback?: React.ReactNode
  componentProps?: object // some fancy generic type would be nice here but it's Probably Fine™️
  Component: React.ComponentType<{fileDiffReference: FileDiffReference}>
}

// the idea here is that the wrapper will either accept pre-loaded data or the variables needed to query for that data
export type DiffChatWrapperProps<T = object> = DiffChatLoaderProps<T> | DiffChatComparisonLoaderProps<T>

type DiffChatLoaderProps<T> = T & {
  queryVariables: DiffChatWrapperQueryVariables
  referenceData?: never
}

type DiffChatComparisonLoaderProps<T> = T & {
  referenceData: CopilotChatFileDiffReferenceData
  queryVariables: DiffChatWrapper_ComparisonQuery$variables
}

// Wrapper/Loader for components needing a FileDiffReference
export const DiffChatWrapper: React.FC<DiffChatWrapperProps<BaseDiffChatWrapperProps>> = ({
  Component,
  componentProps,
  errorFallback = null,
  suspenseFallback = null,
  ...props
}) => (
  <ErrorBoundary fallback={errorFallback}>
    <Suspense fallback={suspenseFallback}>
      <CopilotCodeChatAccessLoader>
        {props.referenceData ? (
          <CopilotCodeChatComparisonLoader
            Component={Component}
            componentProps={componentProps}
            referenceData={props.referenceData}
            queryVariables={props.queryVariables}
          />
        ) : (
          <CopilotCodeChatReferenceLoader
            Component={Component}
            componentProps={componentProps}
            queryVariables={props.queryVariables}
          />
        )}
      </CopilotCodeChatAccessLoader>
    </Suspense>
  </ErrorBoundary>
)
