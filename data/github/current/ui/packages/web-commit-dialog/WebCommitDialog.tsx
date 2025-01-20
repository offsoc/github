import {DuplicateOnKeydownButton} from '@github-ui/code-view-shared/components/DuplicateOnKeydownButton'
import {useShortcut} from '@github-ui/code-view-shared/hooks/shortcuts'
import type {SaveResponseErrorDetails, WebCommitInfo} from '@github-ui/code-view-types'
import {FlashError} from '@github-ui/flash-error'
import {TextExpander} from '@github-ui/text-expander'
import {GitPullRequestIcon} from '@primer/octicons-react'
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  Link,
  Radio,
  RadioGroup,
  Select,
  TextInput,
} from '@primer/react'
import {Dialog, type DialogProps} from '@primer/react/experimental'
import React, {useCallback, useEffect} from 'react'

import {BranchProtectionNotEnforcedBanner} from './BranchProtectionNotEnforcedBanner'
import {FileStatusIcon} from './FileStatusIcon'
import styles from './WebCommitDialog.module.css'

const COMMIT_MESSAGE_INPUT_ID = 'commit-message-input'
const COMMIT_DESCRIPTION_INPUT_ID = 'commit-description-input'
const BRANCH_NAME_INPUT_ID = 'branch-name-input'

export type WebCommitDialogState = 'closed' | 'pending' | 'saving' | 'saved'

export type FileStatus = 'A' | 'D' | 'M' | 'R'
export type FileStatuses = {[key: string]: FileStatus}

export interface WebCommitDialogProps {
  additionalFooterContent?: JSX.Element
  dialogProps?: Partial<DialogProps>
  helpUrl: string
  placeholderMessage?: string
  refName: string
  webCommitInfo: WebCommitInfo
  onSave: () => void
  dialogState: WebCommitDialogState
  setDialogState: (state: WebCommitDialogState) => void
  message: string
  setMessage: (message: string) => void
  description: string
  setDescription: React.Dispatch<React.SetStateAction<string>>
  isQuickPull: boolean
  setAuthorEmail: React.Dispatch<React.SetStateAction<string | undefined>>
  setIsQuickPull?: React.Dispatch<React.SetStateAction<boolean>>
  prTargetBranch?: string
  setPRTargetBranch?: React.Dispatch<React.SetStateAction<string>>
  errorMessage?: string
  errorDetails?: SaveResponseErrorDetails
  fileStatuses?: FileStatuses
  selectedFiles?: Set<string>
  setSelectedFiles?: React.Dispatch<React.SetStateAction<Set<string>>>
  disableQuickPull?: boolean
  returnFocusRef?: React.RefObject<HTMLElement>
}

// states and transitions:
// closed
//  -> pending
// pending
//  -> closed
//  -> saving
// saving
//  -> saved
//  -> pending
//  -> closed

export function WebCommitDialog({
  additionalFooterContent,
  disableQuickPull,
  dialogProps,
  helpUrl,
  placeholderMessage,
  refName,
  webCommitInfo,
  dialogState,
  onSave,
  setDialogState,
  fileStatuses,
  selectedFiles,
  setSelectedFiles,
  message,
  setMessage,
  description,
  setDescription,
  isQuickPull,
  setIsQuickPull,
  prTargetBranch,
  setPRTargetBranch,
  setAuthorEmail,
  errorMessage,
  errorDetails,
  returnFocusRef,
}: WebCommitDialogProps) {
  const {
    authorEmails,
    canCommitStatus,
    dcoSignoffEnabled,
    dcoSignoffHelpUrl,
    defaultEmail,
    defaultNewBranchName,
    forkedRepo,
    repoHeadEmpty,
    suggestionsUrlEmoji,
    suggestionsUrlIssue,
    suggestionsUrlMention,
  } = webCommitInfo

  const [branchNamedWrong, setBranchNamedWrong] = React.useState(false)
  const isSaving = dialogState === 'saving'
  const branchNameInputRef = React.useRef<HTMLInputElement>(null)
  const flashErrorRef = React.useRef<HTMLDivElement>(null)
  const {submitCommitDialogShortcut} = useShortcut()

  const handleChoiceOneChange = (selectedValue: string | null) => {
    setIsQuickPull?.(selectedValue === 'pr')
  }

  const commitMessageInputRef = React.useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (commitMessageInputRef.current) {
      commitMessageInputRef.current.focus()
    }
  }, [])

  const isIMEOpen = React.useRef(false)

  let webCommitTitle = isQuickPull ? 'Propose changes' : 'Commit changes'

  if (dcoSignoffEnabled) {
    webCommitTitle = `Sign off and ${webCommitTitle.toLocaleLowerCase()}`
  }

  const quickPullChoice = !forkedRepo && !repoHeadEmpty && !disableQuickPull

  const saveHandler = async () => {
    if (isQuickPull && quickPullChoice && prTargetBranch === 'HEAD') {
      setBranchNamedWrong(true)
      branchNameInputRef.current?.focus()
      return
    }
    setBranchNamedWrong(false)
    onSave()
  }

  const checkboxHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const path = event.target.value
      setSelectedFiles?.(prevSelectedFiles => {
        const newSelectedFiles = new Set(prevSelectedFiles)
        if (newSelectedFiles.has(path)) {
          newSelectedFiles.delete(path)
        } else {
          newSelectedFiles.add(path)
        }
        return newSelectedFiles
      })
    },
    [setSelectedFiles],
  )

  useEffect(() => {
    if (errorMessage && flashErrorRef.current) {
      flashErrorRef.current.focus()
    }
  }, [errorMessage])

  // remove nulls from author emails
  const filteredAuthorEmails = authorEmails.filter(email => email)

  // Use the danger button type if a user has to bypass rules to commit
  const saveButtonType = canCommitStatus !== 'allowed' && !isQuickPull ? 'danger' : 'primary'
  const saveButtonMessage =
    canCommitStatus === 'can_bypass' && !isQuickPull ? 'Bypass rules and commit changes' : webCommitTitle

  return (
    <Dialog
      aria-labelledby="web-commit-dialog-header"
      onClose={gesture => {
        if (gesture !== 'close-button') {
          return
        }

        if (!isIMEOpen.current) {
          setDialogState('closed')
        }
      }}
      sx={{overflowY: 'auto'}}
      title={webCommitTitle}
      returnFocusRef={returnFocusRef}
      width="large"
      renderFooter={() => (
        <Box
          sx={{
            borderTop: '1px solid',
            borderColor: 'border.default',
            display: 'flex',
            justifyContent: 'flex-end',
            flexWrap: 'wrap-reverse',
            gap: 2,
            padding: 3,
          }}
        >
          {additionalFooterContent}
          <Button
            onClick={() => {
              setDialogState('closed')
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={saveHandler}
            disabled={isSaving}
            variant={saveButtonType}
            data-hotkey={submitCommitDialogShortcut.hotkey}
          >
            {isSaving ? 'Saving...' : saveButtonMessage}
          </Button>
          <DuplicateOnKeydownButton
            buttonFocusId={COMMIT_MESSAGE_INPUT_ID}
            buttonHotkey={submitCommitDialogShortcut.hotkey}
            onlyAddHotkeyScopeButton={true}
            onButtonClick={saveHandler}
          />
          <DuplicateOnKeydownButton
            buttonFocusId={COMMIT_DESCRIPTION_INPUT_ID}
            buttonHotkey={submitCommitDialogShortcut.hotkey}
            onlyAddHotkeyScopeButton={true}
            onButtonClick={saveHandler}
          />
          <DuplicateOnKeydownButton
            buttonFocusId={BRANCH_NAME_INPUT_ID}
            buttonHotkey={submitCommitDialogShortcut.hotkey}
            onlyAddHotkeyScopeButton={true}
            onButtonClick={saveHandler}
          />
        </Box>
      )}
      {...dialogProps}
    >
      <FlashError
        prefix="There was an error committing your changes:"
        errorMessageUsingPrefix={errorMessage}
        ruleErrors={errorDetails?.ruleViolations}
        helpUrl={helpUrl}
        flashRef={flashErrorRef}
      />

      <form
        onSubmit={(event: React.FormEvent) => {
          saveHandler()
          event.preventDefault()
        }}
      >
        <FormControl id={COMMIT_MESSAGE_INPUT_ID}>
          <FormControl.Label>Commit message</FormControl.Label>
          <TextInput
            onChange={event => setMessage(event.target.value)}
            placeholder={placeholderMessage}
            value={message}
            ref={commitMessageInputRef}
            sx={{width: '100%', mb: 3}}
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Extended description</FormControl.Label>
          <TextExpander
            suggestionsUrlIssue={suggestionsUrlIssue}
            suggestionsUrlMention={suggestionsUrlMention}
            suggestionsUrlEmoji={suggestionsUrlEmoji}
            value={description}
            setValue={setDescription}
            sx={{width: '100%', mb: 3}}
            textareaProps={{
              placeholder: 'Add an optional extended description..',
              onCompositionStart: () => (isIMEOpen.current = true),
              onCompositionEnd: () => (isIMEOpen.current = false),
              id: COMMIT_DESCRIPTION_INPUT_ID,
            }}
          />
        </FormControl>

        {filteredAuthorEmails.length > 1 ? (
          <FormControl sx={{mb: 3}}>
            <FormControl.Label>Commit Email</FormControl.Label>
            <Select
              onChange={ev => {
                setAuthorEmail(ev.target.value)
              }}
              defaultValue={defaultEmail}
            >
              {authorEmails.map((email, index) => (
                <Select.Option key={index} value={email}>
                  {email}
                </Select.Option>
              ))}
            </Select>
            {dcoSignoffEnabled && (
              <FormControl.Caption>
                Choose an email address for{' '}
                <Link href={dcoSignoffHelpUrl} target="_blank" rel="noreferrer" inline>
                  signing off
                </Link>{' '}
                on this commit
              </FormControl.Caption>
            )}
          </FormControl>
        ) : dcoSignoffEnabled ? (
          <Box sx={{mb: 3}}>
            You are{' '}
            <Link href={dcoSignoffHelpUrl} target="_blank" rel="noreferrer" inline>
              signing off
            </Link>{' '}
            on this commit as {defaultEmail}
          </Box>
        ) : null}
        {webCommitInfo.protectionNotEnforcedInfo?.upsellCtaInfo.visible && (
          <BranchProtectionNotEnforcedBanner
            branch={refName}
            protectionNotEnforcedInfo={webCommitInfo.protectionNotEnforcedInfo}
          />
        )}
        {quickPullChoice && (
          <RadioGroup name="pr-choice" onChange={handleChoiceOneChange}>
            <RadioGroup.Label visuallyHidden>Direct commit or PR</RadioGroup.Label>
            <FormControl>
              {canCommitStatus !== 'blocked' && (
                <Radio
                  aria-checked={!isQuickPull}
                  aria-describedby={canCommitStatus === 'can_bypass' && !isQuickPull ? 'bypass-warning' : undefined}
                  value="direct"
                  defaultChecked={!isQuickPull}
                />
              )}
              <FormControl.Label sx={{fontWeight: 'normal'}}>
                {canCommitStatus !== 'blocked' ? (
                  <>
                    Commit directly to the{' '}
                    <Box as="pre" sx={{display: 'inline'}}>
                      {refName}
                    </Box>{' '}
                    branch
                  </>
                ) : (
                  <>
                    You can’t commit to{' '}
                    <Box as="pre" sx={{display: 'inline'}}>
                      {refName}
                    </Box>{' '}
                    because it is a{' '}
                    <Link
                      href={`${helpUrl}/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests`}
                      inline
                    >
                      protected branch
                    </Link>
                  </>
                )}
              </FormControl.Label>
              {canCommitStatus !== 'blocked' && canCommitStatus === 'can_bypass' && !isQuickPull && (
                <FormControl.Caption>Some rules will be bypassed by committing directly</FormControl.Caption>
              )}
            </FormControl>
            <FormControl>
              <Radio aria-checked={isQuickPull} value="pr" defaultChecked={isQuickPull} />
              <FormControl.Label sx={{fontWeight: 'normal'}}>
                Create a <strong>new branch</strong> for this commit and start a pull request{' '}
                <Link
                  href={`${helpUrl}/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests`}
                  sx={{fontSize: 0}}
                  inline
                >
                  Learn more about pull requests
                </Link>
              </FormControl.Label>
            </FormControl>
            {isQuickPull && (
              <Box sx={{mt: 3, mx: 3}}>
                <FormControl id={BRANCH_NAME_INPUT_ID}>
                  <FormControl.Label visuallyHidden>Branch Name</FormControl.Label>
                  <TextInput
                    ref={branchNameInputRef}
                    aria-label="PR target branch"
                    leadingVisual={GitPullRequestIcon}
                    onChange={event => setPRTargetBranch?.(event.target.value)}
                    placeholder={defaultNewBranchName}
                    sx={{width: '100%'}}
                    value={prTargetBranch}
                  />

                  {branchNamedWrong && (
                    <FormControl.Validation variant="error">
                      New branch name can not be &quot;HEAD&quot;
                    </FormControl.Validation>
                  )}
                </FormControl>
              </Box>
            )}
          </RadioGroup>
        )}
        {fileStatuses && selectedFiles && (
          <CheckboxGroup sx={{flexGrow: 1}}>
            <CheckboxGroup.Label>Changes to commit</CheckboxGroup.Label>
            {Object.entries(fileStatuses).map(([path, status]) => (
              <FormControl key={path}>
                <Checkbox value={path} checked={selectedFiles.has(path)} onChange={checkboxHandler} />
                <FormControl.Label sx={{display: 'flex'}}>
                  <div className={styles.commitFileIcon}>
                    <FileStatusIcon status={status} />
                  </div>
                  {path}
                </FormControl.Label>
              </FormControl>
            ))}
          </CheckboxGroup>
        )}
      </form>
    </Dialog>
  )
}
