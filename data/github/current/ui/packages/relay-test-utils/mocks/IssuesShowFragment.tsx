import {Suspense} from 'react'
import {graphql, useFragment, useQueryLoader, usePreloadedQuery, type PreloadedQuery} from 'react-relay'
import type {IssuesShowFragment$key} from './__generated__/IssuesShowFragment.graphql'
import type {IssuesShowFragmentViewer$key} from './__generated__/IssuesShowFragmentViewer.graphql'
import type {IssuesShowFragmentLabelQuery} from './__generated__/IssuesShowFragmentLabelQuery.graphql'
import {Heading} from '@primer/react'
import {LazyLoadRepoDescription} from './LazyLoadRepoDescription'

const IssuesShowFragmentLabelQueryNode = graphql`
  query IssuesShowFragmentLabelQuery($owner: String!, $repo: String!) {
    repository(owner: $owner, name: $repo) {
      labels(first: 3) {
        nodes {
          name
        }
      }
    }
  }
`

export function IssuesShowFragment({
  issueKey,
  viewerKey,
  nameWithOwner,
}: {
  issueKey: IssuesShowFragment$key
  viewerKey: IssuesShowFragmentViewer$key
  nameWithOwner: string
}) {
  const {title, number} = useFragment(
    graphql`
      fragment IssuesShowFragment on Issue {
        title
        number
      }
    `,
    issueKey,
  )
  const {name} = useFragment(
    graphql`
      fragment IssuesShowFragmentViewer on User {
        name
      }
    `,
    viewerKey,
  )
  const [labelQueryReference, loadLabelQuery] = useQueryLoader<IssuesShowFragmentLabelQuery>(
    IssuesShowFragmentLabelQueryNode,
  )

  const [owner, repo] = nameWithOwner.split('/')

  return (
    <>
      <p>You are {name}</p>
      <Heading as="h2">
        Issues Show Page — {title} #{number}
      </Heading>
      <p>Name with owner: {nameWithOwner}</p>
      {typeof repo !== 'undefined' && typeof owner !== 'undefined' && (
        <>
          <p>
            Repo description:{' '}
            <Suspense fallback="loading description...">
              <LazyLoadRepoDescription owner={owner} repo={repo} />
            </Suspense>
          </p>
          <p>
            <button onClick={() => loadLabelQuery({owner, repo})} disabled={labelQueryReference !== null}>
              click to load labels
            </button>
          </p>
        </>
      )}
      <Suspense fallback="loading labels">
        {labelQueryReference && <Labels labelQueryReference={labelQueryReference} />}
      </Suspense>
    </>
  )
}

function Labels({
  labelQueryReference,
}: {
  labelQueryReference: PreloadedQuery<IssuesShowFragmentLabelQuery, Record<string, unknown>>
}) {
  const data = usePreloadedQuery<IssuesShowFragmentLabelQuery>(IssuesShowFragmentLabelQueryNode, labelQueryReference)

  return <ul>{data.repository?.labels?.nodes?.map(label => <li key={label?.name}>label: {label?.name}</li>)}</ul>
}
