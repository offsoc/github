import {transformContentToHTML} from '@github-ui/copilot-chat/utils/markdown'
import type {CommitReference} from '@github-ui/copilot-chat/utils/copilot-chat-types'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {MarkdownViewer} from '@github-ui/markdown-viewer'
import {repoOverviewUrl} from '@github-ui/paths'
import {GitCommitIcon, LinkExternalIcon, RepoIcon} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'

import {ReferencePreview} from './ReferencePreview'

export function CommitReferencePreview<T extends CommitReference>({
  reference,
  // TODO: details,
  detailsLoading,
  detailsError,
  onDismiss,
}: {
  reference: T
  // details: ReferenceDetails<T> | undefined
  detailsLoading: boolean
  detailsError: boolean
  onDismiss?: () => void
}) {
  return (
    <ReferencePreview.Frame>
      <ReferencePreview.Header onDismiss={onDismiss}>
        <Octicon icon={GitCommitIcon} sx={{mr: 2}} />
        <Box sx={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>{reference.message}</Box>
      </ReferencePreview.Header>
      <ReferencePreview.Body detailsError={detailsError} detailsLoading={detailsLoading}>
        <Box sx={{display: 'flex', flexDirection: 'row', p: 3}}>
          <GitHubAvatar src={`${reference.author.login}.png`} sx={{mr: 2, flexShrink: 0}} />
          <Box sx={{textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', direction: 'rtl'}}>
            {reference.author.login}
          </Box>
        </Box>

        <Box
          sx={{
            borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
          }}
        />

        <ReferencePreview.Content>
          <MarkdownViewer verifiedHTML={transformContentToHTML(reference.message)} />
        </ReferencePreview.Content>

        <Box
          sx={{
            borderBottom: '1px solid var(--borderColor-default, var(--color-border-default))',
          }}
        />

        <ReferencePreview.Details>
          <ReferencePreview.DetailLink
            href={repoOverviewUrl({name: reference.repository.name, ownerLogin: reference.repository.owner})}
            icon={RepoIcon}
          >
            {reference.repository.owner}/{reference.repository.name}
          </ReferencePreview.DetailLink>

          <ReferencePreview.DetailLink href={reference.permalink} icon={LinkExternalIcon}>
            {reference.repository.owner}/{reference.repository.name}/commit/{reference.oid}
          </ReferencePreview.DetailLink>
        </ReferencePreview.Details>
      </ReferencePreview.Body>
    </ReferencePreview.Frame>
  )
}
