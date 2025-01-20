import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import {Box, Button, Dialog, Portal, Text} from '@primer/react'
import type React from 'react'
import {graphql, useFragment} from 'react-relay'

import type {
  HeaderMetadata_pullRequest$data,
  HeaderMetadata_pullRequest$key,
} from './__generated__/HeaderMetadata_pullRequest.graphql'
import {AlphaBadgeAndActions} from './AlphaBadgeAndActions'
import {HeaderBranchInfo} from './HeaderBranchInfo'
import {PullRequestStateLabel} from './PullRequestStateLabel'
import {TitleText} from './TitleText'

export default function HeaderMetadata({
  pullRequest,
  refListCacheKey,
  isSticky,
  title,
  baseBranch,
  isEditing,
  confirmSave,
  selectNewBaseBranch,
  saveChanges,
  updateEditingState,
  saveButtonRef,
}: {
  pullRequest: HeaderMetadata_pullRequest$key
  refListCacheKey: string
  isSticky?: boolean
  title: string
  baseBranch: string
  isEditing: boolean
  confirmSave: boolean
  selectNewBaseBranch: (newBaseBranch: string) => void
  saveChanges: (e: React.FormEvent) => void
  updateEditingState: (state: {confirmSave?: boolean}) => void
  saveButtonRef: React.RefObject<HTMLButtonElement>
}) {
  const data: HeaderMetadata_pullRequest$data = useFragment(
    graphql`
      fragment HeaderMetadata_pullRequest on PullRequest {
        ...HeaderBranchInfo_pullRequest
        titleHTML
        title
        isDraft
        number
        state
        isInMergeQueue
        repository {
          nameWithOwner
        }
      }
    `,
    pullRequest,
  )

  // Responsive behavior
  // We need to ensure the sticky header stays a constant height, so we hide elements as the viewport decreases in size
  const {screenSize} = useScreenSize()
  const hideContent = isSticky && screenSize < ScreenSize.medium

  const number = data.number
  const repoNameWithOwner = data.repository.nameWithOwner

  return (
    <Box
      sx={{
        height: isSticky ? '56px' : ['auto', 'auto', 'auto', '56px'],
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        flexGrow: 1,
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1, py: 2}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: isSticky ? 'unset' : 'wrap',
            alignItems: 'center',
            flexGrow: isEditing ? 1 : undefined,
            minWidth: 0,
            overflow: 'hidden',
          }}
        >
          {!hideContent && (
            <PullRequestStateLabel isDraft={data.isDraft} isInMergeQueue={data.isInMergeQueue} pullState={data.state} />
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              flexGrow: 1,
              maxWidth: '100%',
              width: isSticky ? '100%' : 'initial',
              overflow: 'hidden',
            }}
          >
            {isSticky && (
              <Text
                as="bdi"
                sx={{
                  fontSize: 1,
                  fontWeight: 600,
                  maxWidth: '100%',
                  display: 'flex',
                  gap: 1,
                }}
              >
                <TitleText isSticky={true} title={data.title} titleHTML={data.titleHTML} />
                <Text
                  sx={{
                    flexShrink: 0,
                    fontSize: 1,
                    fontWeight: 300,
                    color: 'fg.muted',
                  }}
                >
                  #{data.number}
                </Text>
              </Text>
            )}
            {!hideContent && (
              <HeaderBranchInfo
                isEditing={isEditing}
                isSticky={isSticky}
                pullRequest={data}
                refListCacheKey={refListCacheKey}
                selectedBaseBranch={baseBranch}
                onSelectBaseBranch={selectNewBaseBranch}
              />
            )}
          </Box>
          {!isSticky && !isEditing && (
            <Box sx={{display: ['none', 'none', 'none', 'flex']}}>
              <AlphaBadgeAndActions pullRequestNumber={number} repoNameWithOwner={repoNameWithOwner} />
            </Box>
          )}
        </Box>
      </Box>
      <Portal>
        <Dialog
          aria-labelledby="confirm-change-base-branch"
          isOpen={confirmSave}
          returnFocusRef={saveButtonRef}
          onDismiss={() => updateEditingState({confirmSave: false})}
        >
          <Dialog.Header id="confirm-change-base-branch">Are you sure you want to change the base?</Dialog.Header>
          <Box sx={{p: 3}}>
            <span>
              Some commits from the old base branch may be removed from the timeline, and old review comments may become
              outdated
            </span>
            <Button block sx={{mt: 3}} variant="primary" onClick={saveChanges}>
              Change base {title !== data.title && 'and update title'}
            </Button>
          </Box>
        </Dialog>
      </Portal>
    </Box>
  )
}
