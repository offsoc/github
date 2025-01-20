import {Box, Radio, RadioGroup, FormControl, Link} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {LABELS} from '../../constants/labels'
import {BUTTON_LABELS} from '../../constants/buttons'
import {type ChangeEvent, useCallback, useState} from 'react'
import {commitLockLockableMutation} from '../../mutations/lock-lockable-mutation'
// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {useRelayEnvironment} from 'react-relay'
import type {LockLockableInput, LockReason} from '../../mutations/__generated__/lockLockableMutation.graphql'
import {commitUnlockLockableMutation} from '../../mutations/unlock-lockable-mutation'

type IssueConversationLockDialogProps = {
  issueId: string
  isUnlocked?: boolean
  onClose: () => void
}

export const IssueConversationLock = (props: IssueConversationLockDialogProps) => {
  const environment = useRelayEnvironment()
  const {isUnlocked = true, onClose, issueId} = props
  const {addToast} = useToastContext()
  const [lockedReason, setLockedReason] = useState<LockReason | null>(null)

  const handleClose = useCallback(() => {
    onClose()
    setLockedReason(null)
  }, [onClose])

  const handleLockConversation = useCallback(() => {
    if (isUnlocked) {
      const input: LockLockableInput = {
        lockableId: issueId,
        lockReason: lockedReason || null,
      }

      commitLockLockableMutation({
        environment,
        input,
        onError: (e: Error) => {
          handleClose()
          reportError(formatError(e.message))
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: e.message,
          })
        },
        onCompleted: () => {
          handleClose()
        },
      })
    }
  }, [addToast, environment, isUnlocked, issueId, lockedReason, handleClose])

  const handleUnlockConversation = useCallback(() => {
    if (!isUnlocked) {
      const input: LockLockableInput = {
        lockableId: issueId,
      }

      commitUnlockLockableMutation({
        environment,
        input,
        onError: (e: Error) => {
          handleClose()
          reportError(formatError(e.message))
          // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
          addToast({
            type: 'error',
            message: e.message,
          })
        },
        onCompleted: () => {
          handleClose()
        },
      })
    }
  }, [addToast, environment, isUnlocked, issueId, handleClose])

  const onChangeHandler = useCallback((selected: string | null, e: ChangeEvent<HTMLInputElement> | undefined) => {
    if (e) {
      setLockedReason(e.target.value as LockReason)
      return
    }
  }, [])

  return (
    <Dialog
      title={isUnlocked ? LABELS.lock.title : LABELS.lock.titleUnlock}
      renderBody={
        isUnlocked ? () => LockConversationContent({handleReasonChange: onChangeHandler}) : UnlockConversationContent
      }
      onClose={handleClose}
      footerButtons={[
        {content: BUTTON_LABELS.cancel, onClick: handleClose},
        {
          content: isUnlocked ? LABELS.lock.buttonConfirmLock : LABELS.lock.buttonConfirmUnlock,
          buttonType: 'primary',
          onClick: isUnlocked ? handleLockConversation : handleUnlockConversation,
        },
      ]}
    />
  )
}

const LockConversationContent = ({
  handleReasonChange,
}: {
  handleReasonChange: (selected: string | null, e: ChangeEvent<HTMLInputElement> | undefined) => void
}) => {
  return (
    <Box sx={{m: 4}}>
      <span>
        Other users can&apos;t add new comments to this issue. You and other members of teams with&nbsp;
        <Link
          inline
          href="https://docs.github.com/articles/what-are-the-different-access-permissions"
          target="_blank"
          rel="noreferrer"
        >
          write access
        </Link>
        &nbsp;to this repository can still leave comments that others can see. You can always unlock this issue again in
        the future.
      </span>
      <RadioGroup
        name="choiceReason"
        onChange={(selected, e: ChangeEvent<HTMLInputElement> | undefined) => handleReasonChange(selected, e)}
        sx={{mt: 2}}
      >
        <RadioGroup.Label>Reason</RadioGroup.Label>
        <FormControl>
          <Radio value={''} />
          <FormControl.Label> No reason</FormControl.Label>
        </FormControl>
        <FormControl>
          <Radio value={'SPAM'} />
          <FormControl.Label>Spam</FormControl.Label>
        </FormControl>
        <FormControl>
          <Radio value={'OFF_TOPIC'} />
          <FormControl.Label>Off-topic</FormControl.Label>
        </FormControl>
        <FormControl>
          <Radio value={'TOO_HEATED'} />
          <FormControl.Label>Too heated</FormControl.Label>
        </FormControl>
        <FormControl>
          <Radio value={'RESOLVED'} />
          <FormControl.Label>Resolved</FormControl.Label>
        </FormControl>
      </RadioGroup>
    </Box>
  )
}

const UnlockConversationContent = () => {
  return (
    <Box sx={{m: 4}}>
      Everyone will be able to comment on this issue once more. You can always lock this issue again in the future.
    </Box>
  )
}

function formatError(message: string) {
  return new Error(`Issue lock conversation mutation failed with error:${message}`)
}
