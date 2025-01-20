import {useFeatureFlags} from '@github-ui/react-core/use-feature-flag'
import {GlobalCommands, type CommandId} from '@github-ui/ui-commands'
import {useKeyPress} from '@github-ui/use-key-press'
import {useCallback, useRef, useState, type RefObject} from 'react'

type LazyItemPickerProps = {
  hotkey?: string
  anchorElement: (props: React.HTMLAttributes<HTMLElement>, ref: RefObject<HTMLButtonElement>) => JSX.Element
  createChild: () => JSX.Element
  insidePortal?: boolean
  keybindingCommandId?: CommandId
}

export function LazyItemPicker({
  anchorElement,
  createChild,
  hotkey,
  insidePortal,
  keybindingCommandId,
}: LazyItemPickerProps): JSX.Element {
  const [wasTriggered, setWasTriggered] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const {issues_react_ui_commands_migration} = useFeatureFlags()

  const handleKeyPress = useCallback(() => {
    if (!wasTriggered) {
      setWasTriggered(true)
    }
  }, [wasTriggered, setWasTriggered])

  useKeyPress(
    hotkey ? [hotkey] : [],
    (e: KeyboardEvent) => {
      if (!wasTriggered) {
        setWasTriggered(true)
        e.preventDefault()
      }
    },
    {triggerWhenPortalIsActive: insidePortal},
  )

  if (!wasTriggered) {
    return (
      <>
        {issues_react_ui_commands_migration && keybindingCommandId && (
          <GlobalCommands commands={{[keybindingCommandId]: handleKeyPress}} />
        )}
        {anchorElement({onClick: () => setWasTriggered(true)}, anchorRef)}
      </>
    )
  }

  return createChild()
}
