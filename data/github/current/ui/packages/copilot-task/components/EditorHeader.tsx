import type {TreePane} from '@github-ui/repos-file-tree-view'
import {KebabHorizontalIcon, TerminalIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, Heading, IconButton, TextInput} from '@primer/react'
import {type RefObject, useEffect, useRef, useState} from 'react'

import {useIsNewFilePage} from '../hooks/path-match-hooks'

function HeaderActions({
  buttonRef,
  isDeleted,
  onRenameSelected,
}: {
  buttonRef: RefObject<HTMLButtonElement>
  isDeleted: boolean
  onRenameSelected: () => void
}) {
  if (isDeleted) return null

  return (
    <ActionMenu anchorRef={buttonRef}>
      <ActionMenu.Anchor>
        <IconButton aria-label="More file options" icon={KebabHorizontalIcon} variant="invisible" />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="auto">
        <ActionList>
          <ActionList.Item onSelect={onRenameSelected}>Rename</ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

export type EditorHeaderProps = {
  isDeleted: boolean
  onSaveFileName: (newFileName: string) => void
  onTerminalClick: () => void
  path: string
  terminalHeaderButtonRef: RefObject<HTMLButtonElement>
} & Pick<TreePane, 'isTreeExpanded' | 'treeToggleElement'>

export function EditorHeader({
  isDeleted,
  isTreeExpanded,
  onSaveFileName,
  onTerminalClick,
  path,
  terminalHeaderButtonRef,
  treeToggleElement,
}: EditorHeaderProps) {
  const [pathInputValue, setPathInputValue] = useState(path)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const moreOptionsButtonRef = useRef<HTMLButtonElement>(null)
  const isNewFilePage = useIsNewFilePage()

  const isInputValueValid = pathInputValue && pathInputValue !== path

  const showFileInput = isNewFilePage || isEditing

  useEffect(() => {
    // focus the input ref when the user selects "rename"
    if (isEditing) {
      inputRef.current?.focus()
    }
  }, [isEditing])

  return (
    <div className="d-flex flex-row flex-items-center flex-justify-between p-2 border-bottom bgColor-default">
      <div className="d-flex flex-row flex-items-center">
        {!isTreeExpanded && treeToggleElement}
        {showFileInput ? (
          <div className="d-flex flex-row flex-items-center gap-2">
            <Heading as="h1" className="sr-only">
              {isNewFilePage ? 'Creating a new file in pull request editor' : 'Renaming file in pull request editor'}
            </Heading>
            <TextInput
              ref={inputRef}
              placeholder="Name your file..."
              value={pathInputValue}
              onChange={e => setPathInputValue(e.target.value)}
            />
            <Button
              aria-disabled={!isInputValueValid}
              inactive={!isInputValueValid}
              onClick={() => isInputValueValid && onSaveFileName(pathInputValue)}
              variant="primary"
            >
              Save
            </Button>
            {!isNewFilePage && (
              <Button
                onClick={() => {
                  setIsEditing(false)
                  setPathInputValue(path)

                  // return focus to the "more options" button
                  moreOptionsButtonRef.current?.focus()
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        ) : (
          <Heading as="h1" className="f5 pl-2">
            {path}
          </Heading>
        )}
      </div>
      <div className="d-flex gap-2">
        <IconButton
          ref={terminalHeaderButtonRef}
          aria-label="Open console panel"
          icon={TerminalIcon}
          onClick={onTerminalClick}
          variant="invisible"
        />
        <HeaderActions
          buttonRef={moreOptionsButtonRef}
          isDeleted={isDeleted}
          onRenameSelected={() => setIsEditing(true)}
        />
      </div>
    </div>
  )
}
