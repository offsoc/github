import type {FileDiffReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {useMemo} from 'react'
import {graphql, useFragment} from 'react-relay'
import type {
  useFileDiffReference_Comparison$data,
  useFileDiffReference_Comparison$key,
} from './__generated__/useFileDiffReference_Comparison.graphql'
import type {
  useFileDiffReference_DiffEntry$data,
  useFileDiffReference_DiffEntry$key,
} from './__generated__/useFileDiffReference_DiffEntry.graphql'

const ComparisonFragment = graphql`
  fragment useFileDiffReference_Comparison on PullRequestComparison {
    oldCommit {
      oid
      repository {
        databaseId
        name
        url
        owner {
          login
        }
      }
    }
    newCommit {
      oid
      repository {
        databaseId
        name
        url
        owner {
          login
        }
      }
    }
  }
`

const DiffEntryFragment = graphql`
  fragment useFileDiffReference_DiffEntry on PullRequestDiffEntry {
    pathDigest
    path
    rawUrl
    isBinary
    isSubmodule
    isLfsPointer
    oldTreeEntry {
      path
      size
    }
    newTreeEntry {
      path
      size
    }
  }
`

// CAPI will only pull in files that are less than 1MB in size
const ONE_MB = 1_048_576

// omitting the $fragmentType just for easier use externally
type FileDiffReferenceDiffEntry = Omit<useFileDiffReference_DiffEntry$data, ' $fragmentType'>

// force these to be writeable
type DeepWriteable<T> = {-readonly [P in keyof T]: DeepWriteable<T[P]>}
export type CopilotChatFileDiffReferenceData = DeepWriteable<FileDiffReferenceDiffEntry>

/** Convert the GraphQL query result to a `FileDiffReference` compatible with Copilot. */
export const buildFileDiffReference = (
  {oldCommit, newCommit}: useFileDiffReference_Comparison$data,
  {oldTreeEntry, newTreeEntry, ...diffEntry}: FileDiffReferenceDiffEntry,
  latestCommitOid?: string,
): FileDiffReference | undefined => {
  if (
    diffEntry.isBinary ||
    diffEntry.isSubmodule ||
    diffEntry.isLfsPointer ||
    !newTreeEntry || // deleted files
    (oldTreeEntry?.size ?? 0) > ONE_MB ||
    (newTreeEntry.size ?? 0) > ONE_MB
  )
    return undefined

  const headFileCommitOid = oldTreeEntry || !latestCommitOid ? newCommit.oid : latestCommitOid
  return {
    type: 'file-diff',
    id: `diff-${diffEntry.pathDigest}`,
    url: diffEntry.rawUrl ?? '',
    baseFile: oldTreeEntry
      ? {
          type: 'file',
          repoID: oldCommit.repository.databaseId ?? 0,
          repoName: oldCommit.repository.name,
          repoOwner: oldCommit.repository.owner.login,
          path: oldTreeEntry.path ?? '',
          commitOID: oldCommit.oid,
          url: `${oldCommit.repository.url}/raw/${oldCommit.oid}/${oldTreeEntry.path}`,
          ref: oldCommit.oid,
        }
      : null,
    headFile: {
      type: 'file',
      repoID: newCommit.repository.databaseId ?? 0,
      repoName: newCommit.repository.name,
      repoOwner: newCommit.repository.owner.login,
      path: newTreeEntry.path ?? '',
      commitOID: headFileCommitOid,
      url: `${newCommit.repository.url}/raw/${headFileCommitOid}/${newTreeEntry.path}`,
      ref: headFileCommitOid,
    },
    head: null,
    base: null,
  }
}

export const useFileDiffReference = (
  comparisonKey: useFileDiffReference_Comparison$key,
  diffEntryKey: useFileDiffReference_DiffEntry$key,
  latestCommitOid?: string,
) => {
  const comparison = useFragment(ComparisonFragment, comparisonKey)
  const diffEntry = useFragment(DiffEntryFragment, diffEntryKey)

  return useMemo(
    () => buildFileDiffReference(comparison, diffEntry, latestCommitOid),
    [comparison, diffEntry, latestCommitOid],
  )
}

export const useFileDiffReferenceWithEntryProvided = (
  comparisonKey: useFileDiffReference_Comparison$key,
  diffEntry: FileDiffReferenceDiffEntry,
) => {
  const comparison = useFragment(ComparisonFragment, comparisonKey)

  return useMemo(() => buildFileDiffReference(comparison, diffEntry), [comparison, diffEntry])
}
