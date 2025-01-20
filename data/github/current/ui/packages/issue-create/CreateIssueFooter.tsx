import {Box, Button, Checkbox, FormControl, Link, Octicon, Text} from '@primer/react'
import type {DialogProps} from '@primer/react/experimental'

import {BUTTON_LABELS} from './constants/buttons'
import {TEST_IDS} from './constants/test-ids'
import {HOTKEYS} from './constants/hotkeys'
import {LABELS} from './constants/labels'
import {useIssueCreateConfigContext} from './contexts/IssueCreateConfigContext'
import {useKeyPress} from '@github-ui/use-key-press'
import {issuePath} from '@github-ui/paths'
import {isMacOS} from '@github-ui/get-os'
import {useEffect, useRef, useState} from 'react'
import {InfoIcon} from '@primer/octicons-react'
import {CommandButton, GlobalCommands} from '@github-ui/ui-commands'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'

type CreateIssueFooterProps = {
  onClose: () => void
} & DialogProps

export const CreateIssueFooter = ({sx, onClose}: CreateIssueFooterProps) => {
  const {
    createMore,
    setCreateMore,
    createMoreCreatedPath,
    onCreateAction,
    isSubmitting,
    isFileUploading,
    isSubIssue,
    optionConfig: {insidePortal},
  } = useIssueCreateConfigContext()
  const macOS = isMacOS()
  const {issues_react_ui_commands_migration} = useFeatureFlags()

  const handleCheckMoreChange = () => {
    setCreateMore(!createMore)
  }

  const handleCreateMore = () => {
    setCreateMore(true)
    if (!shouldSubmit()) {
      return
    }
    onCreateAction?.current?.onCreate(isSubmitting, true)
  }

  useKeyPress(
    [HOTKEYS.enter],
    () => {
      if (issues_react_ui_commands_migration) return
      handleSubmit()
    },
    {
      metaKey: macOS ? true : false,
      ctrlKey: macOS ? false : true,
      triggerWhenInputElementHasFocus: true,
      triggerWhenPortalIsActive: true,
    },
  )

  useKeyPress(
    [HOTKEYS.enter],
    () => {
      if (issues_react_ui_commands_migration) return
      handleCreateMore()
    },
    {metaKey: true, altKey: true, triggerWhenInputElementHasFocus: true, triggerWhenPortalIsActive: true},
  )

  const [createWaitingOnUpload, setCreateWaitingOnUpload] = useState<boolean>(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const shouldSubmit = () => {
    if (isSubmitting) {
      return false
    }

    // do not submit if files are still uploading
    if (isFileUploading) {
      setCreateWaitingOnUpload(true)
      return false
    }

    return true
  }

  const handleSubmit = async () => {
    if (!shouldSubmit()) {
      return
    }

    onCreateAction?.current?.onCreate(isSubmitting, createMore)
  }

  // runs when isFileUploading changes
  useEffect(() => {
    // if the file is not uploading anymore and the submit button was clicked and is not currently submitting, click is emitted
    if (buttonRef.current && !isFileUploading && !isSubmitting && createWaitingOnUpload) {
      setCreateWaitingOnUpload(false)
      buttonRef.current.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))
    }
  }, [isFileUploading, isSubmitting, createWaitingOnUpload])

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', width: '100%'}}>
      {issues_react_ui_commands_migration && (
        <GlobalCommands
          commands={{
            'github:submit-form': handleSubmit,
            'issue-create:submit-and-create-more': handleCreateMore,
          }}
        />
      )}
      {createWaitingOnUpload && (
        <Box
          sx={{
            color: 'fg.muted',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Octicon icon={InfoIcon} size={16} />
          <Text sx={{font: 'var(--text-body-shorthand-medium)'}}>{LABELS.fileUploadWarning}</Text>
        </Box>
      )}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          columnGap: 4,
          rowGap: 3,
          alignItems: 'center',
          flexWrap: 'wrap',
          ...sx,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            ml: insidePortal ? 0 : 2,
            flexGrow: 1,
            justifyContent: ['flex-start', 'flex-start', 'flex-end', 'flex-end'],
            flexWrap: 'wrap',
            rowGap: 1,
          }}
        >
          <FormControl sx={{display: 'flex', alignItems: 'center', '> :first-child': {display: 'contents'}}}>
            <Checkbox checked={createMore} onChange={handleCheckMoreChange} sx={{mt: 0}} />
            <FormControl.Label>
              {isSubIssue ? BUTTON_LABELS.createMoreSubIssues : BUTTON_LABELS.createMore}
            </FormControl.Label>
          </FormControl>
          <div
            data-testid={TEST_IDS.issueCreatedAnnouncement}
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
            role="status"
          >
            {createMoreCreatedPath.number && LABELS.lastIssueCreated(createMoreCreatedPath.number)}
          </div>
          {createMoreCreatedPath.number && (
            <>
              <Text sx={{color: 'fg.muted', display: ['none', 'block', 'block', 'block']}}>·</Text>
              <Link
                href={issuePath({
                  owner: createMoreCreatedPath.owner,
                  repo: createMoreCreatedPath.repo,
                  issueNumber: createMoreCreatedPath.number,
                })}
                data-testid={TEST_IDS.issueCreatedLink}
              >
                {LABELS.lastIssueCreated(createMoreCreatedPath.number)}
              </Link>
            </>
          )}
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
          <Button onClick={() => onClose()}>{BUTTON_LABELS.cancel}</Button>
          {issues_react_ui_commands_migration ? (
            <CommandButton
              commandId="github:submit-form"
              variant="primary"
              inactive={isSubmitting || isFileUploading}
              data-testid={TEST_IDS.createIssueButton}
              ref={buttonRef}
              showKeybindingHint={true}
            >
              {BUTTON_LABELS.create}
            </CommandButton>
          ) : (
            <Button
              variant="primary"
              inactive={isSubmitting || isFileUploading}
              data-testid={TEST_IDS.createIssueButton}
              ref={buttonRef}
              onClick={handleSubmit}
              trailingVisual={() => (
                <Box
                  sx={{
                    borderWidth: 1,
                    borderStyle: 'solid',
                    p: '0px 4px',
                    borderRadius: '6px',
                    borderColor: 'border.subtle',
                    color: 'fg.onEmphasis',
                    fontSize: '11px',
                  }}
                >
                  {HOTKEYS.commandSymbol}&nbsp;{HOTKEYS.enterSymbol}
                </Box>
              )}
            >
              {BUTTON_LABELS.create}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  )
}
