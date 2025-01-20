/**
 *
 * This component is used to take hotkeys that are tied to hidden buttons and duplicate them to work
 * when the user has the hidden text area focused. This is done because the hotkeys library we use
 * does not support hotkeys that work both when a text area is focused and when it is not.
 */

export function DuplicateOnKeydownButton({
  buttonFocusId,
  buttonHotkey,
  onButtonClick,
  buttonTestLabel,
  onlyAddHotkeyScopeButton,
}: {
  buttonFocusId: string
  buttonHotkey: string | undefined
  onButtonClick: (() => void) | ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
  buttonTestLabel?: string
  onlyAddHotkeyScopeButton?: boolean
}) {
  return (
    <>
      <button
        hidden={true}
        data-testid={buttonTestLabel ? buttonTestLabel : ''}
        data-hotkey={buttonHotkey}
        onClick={onButtonClick}
        data-hotkey-scope={buttonFocusId}
      />
      {!onlyAddHotkeyScopeButton && <button hidden={true} data-hotkey={buttonHotkey} onClick={onButtonClick} />}
    </>
  )
}
