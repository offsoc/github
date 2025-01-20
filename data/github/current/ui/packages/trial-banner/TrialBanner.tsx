import {Box, IconButton, Text, Button, type ButtonProps, Octicon} from '@primer/react'
import {InfoIcon, AlertIcon, XIcon} from '@primer/octicons-react'
import type {PropsWithChildren, MouseEventHandler} from 'react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {testIdProps} from '@github-ui/test-id-props'

export interface TrialBannerProps {
  /**
   * Shows a close button when `true`
   */
  showCloseButton?: boolean
  /**
   * A callback which is called whenever the close button is clicked
   */
  closeButtonClick?: MouseEventHandler<HTMLButtonElement>
  /**
   * When defined, renders a primary button. You may pass any Primer Button props to this object.
   * To set Button text content, pass in a text value to the `children` prop
   */
  primaryButtonProps?: ButtonProps

  /**
   * When defined, renders a secondary button. You may pass any Primer Button props to this object.
   * To set Button text content, pass in a text value to the `children` prop
   */
  secondaryButtonProps?: ButtonProps

  /**
   * Banner variants will modify the icon type and color
   */
  variant?: 'active' | 'warning' | 'expired'

  /**
   * Override any default CSS styles using the sx property. https://primer.style/react/overriding-styles
   */
  sx?: BetterSystemStyleObject
}

const variantColors = {
  active: {
    color: 'accent.emphasis',
  },
  warning: {
    color: 'attention.emphasis',
  },
  expired: {
    color: 'danger.emphasis',
  },
}

export function TrialBanner({
  children,
  showCloseButton = true,
  closeButtonClick,
  primaryButtonProps,
  secondaryButtonProps,
  variant = 'active',
  sx,
  ...props
}: PropsWithChildren<TrialBannerProps>) {
  const variantProps = variantColors[variant]
  const variantIcon = variant === 'active' ? InfoIcon : AlertIcon
  const mergedSx: BetterSystemStyleObject = {
    borderWidth: 1,
    borderBottomStyle: 'solid',
    borderColor: 'border.default',
    display: 'flex',
    flexDirection: ['column', 'column', 'row', 'row'],
    minHeight: ['96px', '96px', '44px', '44px'],
    alignItems: ['flex-start', 'flex-start', 'center', 'center'],
    position: 'relative',
    gap: '8px',
    ...sx,
  }
  return (
    <Box sx={mergedSx} {...testIdProps(`growth-trial-banner-${variant}`)} {...props}>
      <Box sx={{display: 'flex', minHeight: '44px', alignItems: 'center', marginRight: '60px'}}>
        <Octicon
          icon={variantIcon}
          size={16}
          sx={{
            marginLeft: '32px',
            ...variantProps,
          }}
        />
        <Text as="span" sx={{marginLeft: '12px', fontSize: '12px', color: 'fg.muted', display: 'inline-block'}}>
          {children}
        </Text>
      </Box>
      <Box
        sx={{
          display: 'flex',
          marginLeft: ['60px', '60px', 'auto', 'auto'],
          flexDirection: ['row-reverse', 'row-reverse', 'row', 'row'],
        }}
      >
        {secondaryButtonProps && (
          <Button variant="invisible" sx={{fontSize: '12px', marginRight: '8px'}} {...secondaryButtonProps} />
        )}
        {primaryButtonProps && <Button sx={{fontSize: '12px', marginRight: '8px'}} {...primaryButtonProps} />}
        {showCloseButton && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            variant="invisible"
            aria-label="Close trial banner"
            onClick={closeButtonClick}
            icon={XIcon}
            size={'medium'}
            {...testIdProps(`growth-trial-banner-close`)}
            sx={{
              marginRight: '16px',
              color: 'fg.muted',
              top: [2, 2, 0, 0],
              right: [2, 2, 0, 0],
              position: ['absolute', 'absolute', 'relative', 'relative'],
            }}
          />
        )}
      </Box>
    </Box>
  )
}
