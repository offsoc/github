import {DuplicateOnKeydownButton} from '@github-ui/code-view-shared/components/DuplicateOnKeydownButton'
import {useShortcut} from '@github-ui/code-view-shared/hooks/shortcuts'
import {useReposAnalytics} from '@github-ui/code-view-shared/hooks/use-repos-analytics'
import type React from 'react'

export function FindFilesShortcut({
  inputRef,
  onFindFilesShortcut,
  textAreaId,
}: {
  inputRef: React.RefObject<HTMLInputElement> | null
  onFindFilesShortcut?: () => void
  textAreaId: string
}) {
  const {sendRepoKeyDownEvent} = useReposAnalytics()
  const {findFilesShortcut} = useShortcut()

  return (
    <DuplicateOnKeydownButton
      buttonFocusId={textAreaId}
      buttonHotkey={findFilesShortcut.hotkey}
      onButtonClick={() => {
        onFindFilesShortcut?.()
        inputRef?.current?.focus()
        sendRepoKeyDownEvent('GO_TO_FILE')
      }}
    />
  )
}
