import {Button} from '@primer/react'
import {Suspense, useCallback, useMemo, useState} from 'react'

import {CreateIssueDialogEntryInternal, type CreateIssueDialogEntryProps} from './dialog/CreateIssueDialogEntry'
import {CreateIssueButtonLoading} from './CreateIssueButtonLoading'
import {ssrSafeWindow} from '@github-ui/ssr-utils'
import {relativeIssueNewPathFromExisting} from './utils/urls'
import {GlobalCommands} from '@github-ui/ui-commands'
import {useKeyPress} from '@github-ui/use-key-press'
import {HOTKEYS} from './constants/hotkeys'
import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'

export type CreateIssueButtonProps = {
  label: string
  size?: 'small' | 'medium'
  isDialogOpenByDefault?: boolean
} & Omit<CreateIssueDialogEntryProps, 'setIsCreateDialogOpen' | 'isCreateDialogOpen'>

export const CreateIssueButton = ({label, size = 'medium', ...props}: CreateIssueButtonProps): JSX.Element | null => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const {issues_react_ui_commands_migration} = useFeatureFlags()

  const onCreateIssueShortcutClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setIsCreateDialogOpen(true)
  }, [])

  const openDialog = useCallback(() => {
    setIsCreateDialogOpen(true)
  }, [])

  const onCreateIssueShortcutPressed = useCallback(
    (event: KeyboardEvent) => {
      if (issues_react_ui_commands_migration || !props.optionConfig?.singleKeyShortcutsEnabled) return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      openDialog()
    },
    [props.optionConfig?.singleKeyShortcutsEnabled, issues_react_ui_commands_migration, openDialog],
  )

  useKeyPress([HOTKEYS.openIssueCreateDialog], onCreateIssueShortcutPressed, {triggerWhenInputElementHasFocus: false})

  const renderedButton = useMemo(() => {
    return (
      <>
        {issues_react_ui_commands_migration && <GlobalCommands commands={{'issue-create:new': openDialog}} />}
        <RenderedCreateButton size={size} label={label} onClick={onCreateIssueShortcutClick} />
      </>
    )
  }, [size, label, onCreateIssueShortcutClick, openDialog, issues_react_ui_commands_migration])

  if (!isCreateDialogOpen) return renderedButton

  return (
    <Suspense fallback={<CreateIssueButtonLoading label={label} size={size} />}>
      {renderedButton}

      <CreateIssueDialogEntryInternal
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        {...props}
      />
    </Suspense>
  )
}

type RenderedCreateButtonProps = {
  label: string
  size?: 'small' | 'medium'
  onClick: (e: React.MouseEvent) => void
}

const RenderedCreateButton = ({size, label, onClick}: RenderedCreateButtonProps) => {
  const pathname = ssrSafeWindow?.location?.pathname ?? ''
  const baseUrlForFullscreenLink = useMemo(() => relativeIssueNewPathFromExisting(pathname), [pathname])

  // We want to default to the underlying anchor functionality when the user is holding down the cmd or ctrl key
  // and therefore ignore the custom onClick functionality.
  const ignoreOnClickIfCmdOrCtrlPressed = (e: React.MouseEvent, clickHandler: (e: React.MouseEvent) => void) => {
    // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
    if (!e.ctrlKey && !e.metaKey) {
      clickHandler(e)
    }

    // ..bubble down to the underlying anchor functionality
  }

  return (
    <Button
      size={size}
      variant={'primary'}
      onClick={(e: React.MouseEvent) => ignoreOnClickIfCmdOrCtrlPressed(e, onClick)}
      as="a"
      href={baseUrlForFullscreenLink}
      target="_blank"
    >
      {label}
    </Button>
  )
}
