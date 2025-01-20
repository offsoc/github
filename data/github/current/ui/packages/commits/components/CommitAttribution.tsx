import type {AuthorSettings} from '@github-ui/commit-attribution'
import {CommitAttribution as UiCommitAttribution} from '@github-ui/commit-attribution'
import type {RepositoryNWO} from '@github-ui/current-repository'
import {RelativeTime} from '@primer/react'
import type {PropsWithChildren} from 'react'

import {useFindDeferredCommitData} from '../contexts/DeferredCommitDataContext'
import type {Commit} from '../types/shared'

interface CommitAttributionProps {
  commit: Commit
  repo: RepositoryNWO
  settings?: Partial<AuthorSettings>
}

export function CommitAttribution({commit, repo, children, settings}: PropsWithChildren<CommitAttributionProps>) {
  const deferredData = useFindDeferredCommitData(commit.oid)

  return (
    <UiCommitAttribution
      authors={commit.authors}
      committer={commit.committer}
      committerAttribution={commit.committerAttribution}
      onBehalfOf={deferredData?.onBehalfOf}
      repo={repo}
      includeVerbs={true}
      authorSettings={{fontWeight: 'normal', fontColor: 'fg.muted', avatarSize: 16, ...settings}}
    >
      <RelativeTime className="pl-1" datetime={commit.committedDate} tense="past" />
      {children}
    </UiCommitAttribution>
  )
}
