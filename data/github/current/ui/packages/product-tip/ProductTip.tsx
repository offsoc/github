import {Box, IconButton, Text, Button, type ButtonProps} from '@primer/react'
import {LightBulbIcon, XIcon} from '@primer/octicons-react'
import type {PropsWithChildren, MouseEventHandler} from 'react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {testIdProps} from '@github-ui/test-id-props'

export interface ProductTipProps {
  /**
   * Shows a close button when `true`
   */
  showCloseButton: boolean
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
   * Override any default CSS styles using the sx property. https://primer.style/react/overriding-styles
   */
  sx?: BetterSystemStyleObject
}

export function ProductTip({
  children,
  showCloseButton,
  closeButtonClick,
  primaryButtonProps,
  sx = {},
  ...props
}: PropsWithChildren<ProductTipProps>) {
  const showButton = !!primaryButtonProps
  const minHeightMobile = showButton ? '72px' : '32px'
  const mergedSx: BetterSystemStyleObject = {
    borderWidth: 1,
    borderTopStyle: 'solid',
    borderColor: 'border.default',
    px: 3,
    py: 2,
    display: 'flex',
    gap: showButton ? '8px' : 0,
    flexDirection: ['column', 'column', 'row', 'row'],
    minHeight: [minHeightMobile, minHeightMobile, '32px', '32px'],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...sx,
  }
  return (
    <Box sx={mergedSx} {...testIdProps('growth-tip')} {...props}>
      <Box sx={{display: 'flex', minHeight: '24px', alignItems: 'center'}}>
        <LightBulbIcon size={16} />
        <Text as="span" sx={{marginLeft: '8px', marginRight: '32px'}}>
          <Text as="span" sx={{fontWeight: 600}}>
            Tip:
          </Text>{' '}
          {children}
        </Text>
      </Box>
      <Box
        sx={{
          display: 'flex',
          marginLeft: ['0', '0', 'auto', 'auto'],
          flexDirection: ['row-reverse', 'row-reverse', 'row', 'row'],
        }}
      >
        {showButton && <Button {...testIdProps('growth-tip-action')} {...primaryButtonProps} />}
        {showCloseButton && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            variant="invisible"
            aria-label="Close tip"
            onClick={closeButtonClick}
            icon={XIcon}
            size={'medium'}
            sx={{
              color: 'fg.muted',
              top: [1, 1, 0, 0],
              right: [1, 1, 0, 0],
              marginLeft: showButton ? '8px' : 0,
              position: ['absolute', 'absolute', 'relative', 'relative'],
            }}
            {...testIdProps('growth-tip-close')}
          />
        )}
      </Box>
    </Box>
  )
}
