import {noop} from '@github-ui/noop'
import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionMenu, Button, ButtonGroup, IconButton, type ButtonProps} from '@primer/react'
import {useEffect, useRef, useState} from 'react'
import {Tooltip} from '@primer/react/next'

type ButtonWithDropdownProps = {
  /**
   * The text to render in the primary button
   */
  children?: string | JSX.Element
  /**
   * Whether the primary button is in a busy state
   */
  ariaBusy?: boolean
  /**
   * Action list component that renders when the secondary icon button is activated
   */
  actionList?: JSX.Element
  /**
   * Whether to make both primary and secondary buttons inactive
   */
  inactive: boolean
  /**
   * Tooltip text if the buttons are inactive
   */
  inactiveTooltipText: string
  /**
   * Optional override that makes the secondary button active even if the inactive prop is set to false
   */
  secondaryButtonActive?: boolean
  /**
   * The aria-label for the secondary button
   */
  secondaryButtonAriaLabel: string
  /**
   * Function to handle the primary button click
   */
  onPrimaryButtonClick: () => void
  /**
   * If buttons should be shown in their primary variant
   */
  isPrimary?: boolean
  /**
   * Whether to focus the primary button on render
   */
  shouldFocusPrimaryButton?: boolean
  /**
   * Optional function to handle focus
   */
  onFocusPrimaryButton?: () => void
  /**
   * Optional boolean to hide secondaryButton
   */
  hideSecondaryButton?: boolean
} & Pick<ButtonProps, 'variant'>

/**
 * Renders a primary button with a secondary icon button dropdown
 */
export function ButtonWithDropdown({
  children,
  actionList,
  ariaBusy,
  inactive,
  inactiveTooltipText,
  secondaryButtonActive,
  secondaryButtonAriaLabel,
  onPrimaryButtonClick,
  shouldFocusPrimaryButton,
  onFocusPrimaryButton,
  isPrimary = false,
  hideSecondaryButton = false,
}: ButtonWithDropdownProps) {
  const primaryButtonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (shouldFocusPrimaryButton) {
      primaryButtonRef.current?.focus()
      onFocusPrimaryButton?.()
    }
  }, [shouldFocusPrimaryButton, onFocusPrimaryButton])

  // The button group constrains the width of the overlay, so we set it to a fixed width
  const overlayWidth = '320px'
  const buttonVariant = isPrimary ? 'primary' : 'default'

  const [isOpen, setIsOpen] = useState(false)

  const secondaryButtonInactive = inactive && !secondaryButtonActive

  const buttonContent = (
    <ButtonGroup>
      <Button
        variant={buttonVariant}
        ref={primaryButtonRef}
        inactive={inactive}
        aria-busy={ariaBusy}
        aria-disabled={inactive}
        onClick={inactive ? noop : onPrimaryButtonClick}
      >
        {children}
      </Button>
      {!hideSecondaryButton && (
        <ActionMenu open={isOpen} onOpenChange={secondaryButtonInactive ? noop : open => setIsOpen(open)}>
          <ActionMenu.Anchor>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              variant={buttonVariant}
              unsafeDisableTooltip={true}
              aria-label={secondaryButtonAriaLabel}
              aria-disabled={secondaryButtonInactive}
              inactive={secondaryButtonInactive}
              icon={TriangleDownIcon}
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay align="end" sx={{width: overlayWidth}}>
            {actionList}
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </ButtonGroup>
  )

  if (inactive) {
    return (
      <Tooltip text={inactiveTooltipText} direction="ne">
        {buttonContent}
      </Tooltip>
    )
  }

  return buttonContent
}
