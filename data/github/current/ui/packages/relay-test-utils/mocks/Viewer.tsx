import {graphql} from 'react-relay'
import {type PreloadedQuery, usePreloadedQuery, useFragment} from 'react-relay/hooks'
import type {ViewerQuery} from './__generated__/ViewerQuery.graphql'
import {IssuesShowFragment} from './IssuesShowFragment'
import {Heading} from '@primer/react'
import type {ViewerIssuesShowPageInternalFragment$key} from './__generated__/ViewerIssuesShowPageInternalFragment.graphql'

interface ViewerProps {
  viewerQuery: PreloadedQuery<ViewerQuery>
  repositoryKey: ViewerIssuesShowPageInternalFragment$key
}

export const Viewer = ({viewerQuery, repositoryKey}: ViewerProps) => {
  const viewer = usePreloadedQuery<ViewerQuery>(
    graphql`
      query ViewerQuery {
        viewer {
          login
          ...IssuesShowFragmentViewer
        }
      }
    `,
    viewerQuery,
  )
  const {nameWithOwner, issue} = useFragment(
    graphql`
      fragment ViewerIssuesShowPageInternalFragment on Repository @argumentDefinitions(number: {type: "Int!"}) {
        nameWithOwner
        issue(number: $number) {
          ...IssuesShowFragment
        }
      }
    `,
    repositoryKey,
  )

  const login = viewer.viewer?.login
  if (!login || !issue) {
    return null
  }

  return (
    <>
      <Heading as="h1">Hello {viewer.viewer.login}</Heading>
      <IssuesShowFragment nameWithOwner={nameWithOwner} issueKey={issue} viewerKey={viewer.viewer} />
    </>
  )
}
