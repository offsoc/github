import {LinesChangedCounterLabel} from '@github-ui/diff-file-header'
import {FileStatusIcon} from '@github-ui/diff-file-tree'
import {ListItem} from '@github-ui/list-view/ListItem'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {useNavigate} from '@github-ui/use-navigate'
import {CommentIcon} from '@primer/octicons-react'
import {Box, Octicon} from '@primer/react'
import {graphql, useFragment} from 'react-relay'

import type {FilesChangedRow_pullRequestSummaryDelta$key} from './__generated__/FilesChangedRow_pullRequestSummaryDelta.graphql'

function pluralize(word: string, count: number) {
  return `${word}${count > 1 ? 's' : ''}`
}

function rtlFix(path: string): string {
  return path.startsWith('.') ? `&lrm;${path}` : path
}

function StyledMetadata({children}: {children: React.ReactNode}) {
  return (
    <Box
      sx={{
        width: '5ch',
        display: ['none', 'flex'],
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
      }}
    >
      {children}
    </Box>
  )
}

export function FilesChangedRow({
  file,
  pullRequestPath,
}: {
  file: FilesChangedRow_pullRequestSummaryDelta$key
  pullRequestPath: string
}) {
  const fileData = useFragment(
    graphql`
      fragment FilesChangedRow_pullRequestSummaryDelta on PullRequestSummaryDelta {
        additions
        changeType
        deletions
        path
        pathDigest
        unresolvedCommentCount
      }
    `,
    file,
  )

  const navigate = useNavigate()
  const pathDigest = fileData.pathDigest
  const filePathUrl = `${pullRequestPath}/files#diff-${pathDigest}`

  const unresolvedCommentCount = fileData.unresolvedCommentCount
  const unresolvedCommentLabel =
    unresolvedCommentCount && `${unresolvedCommentCount} unresolved ${pluralize('comment', unresolvedCommentCount)}`
  const additionsLabel = fileData.additions && `${fileData.additions} ${pluralize('addition', fileData.additions)}`
  const deletionsLabel = fileData.deletions && `${fileData.deletions} ${pluralize('deletion', fileData.deletions)}`
  const metadataLabel = [unresolvedCommentLabel, additionsLabel, deletionsLabel].filter(label => !!label).join(', ')

  const rowAriaLabel = `${fileData.path}: ${metadataLabel}`

  return (
    <ListItem
      aria-label={rowAriaLabel}
      metadata={
        <>
          <StyledMetadata>
            {fileData.unresolvedCommentCount > 0 && (
              <>
                <Octicon icon={CommentIcon} size={16} sx={{color: 'fg.muted'}} />
                <span className="sr-only">
                  {`has ${fileData.unresolvedCommentCount} ${pluralize('comment', fileData.unresolvedCommentCount)}`}
                </span>
                <Box aria-hidden={true} sx={{fontWeight: 600, fontSize: 0}}>
                  {fileData.unresolvedCommentCount}
                </Box>
              </>
            )}
          </StyledMetadata>
          <StyledMetadata>
            {fileData.additions > 0 && (
              <LinesChangedCounterLabel
                isAddition
                sx={{fontVariantNumeric: 'tabular-nums', textAlign: 'right', width: '100%'}}
              >
                +{fileData.additions}
              </LinesChangedCounterLabel>
            )}
          </StyledMetadata>
          <StyledMetadata>
            {fileData.deletions > 0 && (
              <LinesChangedCounterLabel
                isAddition={false}
                sx={{fontVariantNumeric: 'tabular-nums', textAlign: 'right', width: '100%'}}
              >
                -{fileData.deletions}
              </LinesChangedCounterLabel>
            )}
          </StyledMetadata>
        </>
      }
      title={
        <ListItemTitle
          anchorSx={{direction: 'rtl', fontFamily: 'var(--fontStack-monospace)', fontSize: 0}}
          href={filePathUrl}
          value={rtlFix(fileData.path)}
          onClick={e => {
            e.preventDefault()
            navigate(filePathUrl)
          }}
        />
      }
    >
      <ListItemLeadingContent>
        <Box sx={{display: 'flex', alignItems: 'center', height: '100%'}}>
          <FileStatusIcon status={fileData.changeType} />
        </Box>
      </ListItemLeadingContent>
    </ListItem>
  )
}
