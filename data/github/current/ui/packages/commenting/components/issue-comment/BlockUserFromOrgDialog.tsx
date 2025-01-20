import {noop} from '@github-ui/noop'
import {ActionList, ActionMenu, Box, Button, Checkbox, FormControl, Portal, Text} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useCallback, useState} from 'react'
import {useRelayEnvironment} from 'react-relay'
import {commitLocalUpdate} from 'relay-runtime'

import type {
  BlockFromOrganizationDuration,
  ReportedContentClassifiers,
} from '../../mutations/__generated__/blockUserFromOrganizationMutation.graphql'
import {blockUserFromOrganization} from '../../mutations/block-user-from-organization-mutation'
import {HIDE_OPTION_TO_READABLE_MAP, type HIDE_OPTIONS, HideCommentActionItems} from './HideCommentActions'

export type BlockUserFromOrgDialogProps = {
  organization: {login: string; id: string}
  contentId: string
  contentAuthor: {login: string; id: string}
  contentUrl: string
  onClose: () => void
}

export const BLOCKING_DURATION_TO_READABLE_MAP: Record<string, string> = {
  ONE_DAY: 'For 1 day',
  THREE_DAYS: 'For 3 days',
  SEVEN_DAYS: 'For 7 days',
  THIRTY_DAYS: 'For 30 days',
  INDEFINITE: 'Until I unblock them',
}

const INITIAL_SELECTED_BLOCKING_DURATION = 'INDEFINITE'

export const BlockUserFromOrgDialog = ({onClose, ...props}: BlockUserFromOrgDialogProps) => {
  const [selectedBlockingDuration, setSelectedBlockingDuration] = useState<BlockFromOrganizationDuration>(
    INITIAL_SELECTED_BLOCKING_DURATION,
  )

  // Default to true for notifying the blocked user
  const [notifyBlockedUser, setNotifyBlockedUser] = useState<boolean>(true)
  const [hideComment, setHideComment] = useState<boolean>(false)
  const [commentHideOption, setCommentHideOption] = useState<HIDE_OPTIONS | undefined>(undefined)
  const userToBlock = props.contentAuthor.login

  return (
    <Portal>
      <Dialog
        renderHeader={() => <BlockUserFromOrgDialogHeader onClose={onClose} {...props} />}
        renderFooter={() => (
          <BlockUserFromOrgDialogFooter
            onClose={onClose}
            {...props}
            notifyBlockedUser={notifyBlockedUser}
            hideComment={hideComment}
            duration={selectedBlockingDuration}
            hiddenReason={commentHideOption}
          />
        )}
        sx={{
          width: '100%',
          margin: 4,
          maxWidth: '640px',
          maxHeight: 'clamp(315px, 80vh, 800px)',
        }}
        width="xlarge"
        height="auto"
        onClose={onClose}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <div>
              <span>
                Blocking a user prevents them from interacting with repositories of this organization, such as opening
                or commenting on pull requests or issues. Learn more about{' '}
                <a href="https://docs.github.com/communities/maintaining-your-safety-on-github/blocking-a-user-from-your-organization">
                  blocking a user.
                </a>
              </span>
            </div>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            <ActionMenu>
              <ActionMenu.Button>
                Block a user: {BLOCKING_DURATION_TO_READABLE_MAP[selectedBlockingDuration]}
              </ActionMenu.Button>
              <ActionMenu.Overlay>
                <ActionList selectionVariant="single">
                  <ActionList.Group>
                    <ActionList.GroupHeading>Block options</ActionList.GroupHeading>
                    {Object.keys(BLOCKING_DURATION_TO_READABLE_MAP).map(option => (
                      <ActionList.Item
                        key={option}
                        onSelect={() => {
                          setSelectedBlockingDuration(option as BlockFromOrganizationDuration)
                        }}
                        selected={option === selectedBlockingDuration}
                      >
                        {BLOCKING_DURATION_TO_READABLE_MAP[option]}
                      </ActionList.Item>
                    ))}
                  </ActionList.Group>
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Box>
          <DialogDivider />
          <h4>More options</h4>
          <FormControl sx={{mt: 1}}>
            <Checkbox
              checked={notifyBlockedUser}
              onChange={() => setNotifyBlockedUser(!notifyBlockedUser)}
              aria-checked={notifyBlockedUser}
            />
            <FormControl.Label>Send user a notification and show activity in timeline</FormControl.Label>
            <FormControl.Caption>
              <Text sx={{color: 'fg.subtle', fontSize: 12}}>
                You can notify <b>{userToBlock}</b> as to why they&apos;re being blocked. A public timeline entry will
                show that this user was blocked. They will receive an email notification and a notice when they try to
                comment with the following message:
                <Box sx={{mt: 1, ml: 2}}>
                  <blockquote>
                    A maintainer of the @{props.organization.login} organization has blocked you because of{' '}
                    <a href={props.contentUrl}>this content</a>. For more information please see{' '}
                    <a href="https://docs.github.com/site-policy/github-terms/github-community-guidelines">
                      the community guidelines
                    </a>
                    .
                  </blockquote>
                </Box>
              </Text>
            </FormControl.Caption>
          </FormControl>
          <FormControl>
            <Checkbox checked={hideComment} onChange={() => setHideComment(!hideComment)} aria-checked={hideComment} />
            <FormControl.Label>Hide this user&apos;s comments</FormControl.Label>
            <FormControl.Caption>
              <Text sx={{color: 'fg.subtle', fontSize: 12}}>
                All of their comments in this organization{' '}
                <a href="https://docs.github.com/communities/moderating-comments-and-conversations/managing-disruptive-comments#hiding-a-comment">
                  will be hidden
                </a>{' '}
                to all users and will display a reason.
              </Text>
            </FormControl.Caption>
          </FormControl>
          <Box sx={{ml: 4}}>
            <ActionMenu>
              <ActionMenu.Button>
                {(commentHideOption && HIDE_OPTION_TO_READABLE_MAP[commentHideOption]) ?? 'Choose a reason'}
              </ActionMenu.Button>
              <ActionMenu.Overlay>
                <ActionList selectionVariant="single">
                  <HideCommentActionItems onSelect={setCommentHideOption} />
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </Box>
        </Box>
      </Dialog>
    </Portal>
  )

  // Add this in once we update the mutation to support the note
  /*
    <FormControl>
      <FormControl.Label>Add an optional note:</FormControl.Label>
      <TextInput sx={{width: '100%'}} />
      <FormControl.Caption>
        <Text sx={{color: 'fg.subtle', fontSize: 12}}>
          Please don't include any personal information such as legal names or email addresses. Maximum 100
          characters, markdown supported. This note will be visible to only you.
        </Text>
      </FormControl.Caption>
    </FormControl>
  */
}

const DialogDivider = () => {
  return (
    <Box
      sx={{
        height: '1px',
        backgroundColor: 'fg.subtle',
        margin: '8px 0',
      }}
    />
  )
}

const BlockUserFromOrgDialogHeader = ({
  contentAuthor,
  organization,
  onClose,
}: Pick<BlockUserFromOrgDialogProps, 'contentAuthor' | 'onClose' | 'organization'>) => {
  return (
    <Dialog.Header>
      <Box sx={{display: 'flex'}}>
        <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, px: 2, py: '6px'}}>
          <Dialog.Title>
            Block {contentAuthor.login} from {organization.login}
          </Dialog.Title>
        </Box>
        <Dialog.CloseButton onClose={onClose} />
      </Box>
    </Dialog.Header>
  )
}

type BlockUserFromOrgDialogFooterProps = {
  notifyBlockedUser: boolean
  hideComment: boolean
  duration: BlockFromOrganizationDuration
  hiddenReason: HIDE_OPTIONS | undefined
} & BlockUserFromOrgDialogProps

const BlockUserFromOrgDialogFooter = ({
  organization,
  contentAuthor,
  contentId,
  notifyBlockedUser,
  hideComment,
  duration,
  hiddenReason,
  onClose,
}: BlockUserFromOrgDialogFooterProps) => {
  const environment = useRelayEnvironment()

  const onSubmit = useCallback(() => {
    blockUserFromOrganization({
      environment,
      input: {
        organizationId: organization.id,
        contentId,
        blockedUserId: contentAuthor.id,
        duration,
        hiddenReason: hideComment && hiddenReason ? (hiddenReason as ReportedContentClassifiers) : undefined,
        notifyBlockedUser,
      },
      onError: noop,
      onCompleted: () =>
        commitLocalUpdate(environment, store => {
          const contentObject = store.get(contentId)
          contentObject?.setValue(false, 'pendingUnblock')
          contentObject?.setValue(true, 'pendingBlock')
          if (hiddenReason) {
            contentObject?.setValue(hiddenReason, 'pendingMinimizeReason')
          }
        }),
    })

    onClose()
  }, [
    environment,
    organization.id,
    contentId,
    contentAuthor.id,
    duration,
    hideComment,
    hiddenReason,
    notifyBlockedUser,
    onClose,
  ])

  return (
    <Dialog.Footer>
      <Button
        sx={{
          width: '100%',
        }}
        variant={'danger'}
        disabled={hideComment && !hiddenReason}
        onClick={onSubmit}
      >
        Block user from organization
      </Button>
    </Dialog.Footer>
  )
}
