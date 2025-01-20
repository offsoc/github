import {Box, IconButton, Text, Button, Octicon, type ButtonProps} from '@primer/react'
import {type Icon, XIcon} from '@primer/octicons-react'
import type {PropsWithChildren, MouseEventHandler} from 'react'
import {testIdProps} from '@github-ui/test-id-props'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

export interface GrowthBannerProps {
  /**
   * A callback which is called whenever the 'x' close button is clicked
   */
  closeButtonClick?: MouseEventHandler<HTMLButtonElement>
  /**
   * A leading `@primer/octicons-react` Icon.
   */
  icon?: Icon
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
   * Hides the close button when `false`
   * @default true
   */
  showCloseButton?: boolean
  /**
   * Override any default CSS styles using the sx property. https://primer.style/react/overriding-styles
   */
  sx?: BetterSystemStyleObject
  /**
   * GrowthBanner title
   */
  title: string
  /**
   * GrowthBanner variants will modify the icon colors
   */
  variant?: 'default' | 'information' | 'warning' | 'danger' | 'success' | 'done'
}

const variants = {
  default: {
    color: 'fg.default',
    backgroundColor: 'canvas.subtle',
  },
  information: {
    color: 'accent.emphasis',
    backgroundColor: 'accent.subtle',
  },
  warning: {
    color: 'attention.emphasis',
    backgroundColor: 'attention.subtle',
  },
  danger: {
    color: 'danger.emphasis',
    backgroundColor: 'danger.subtle',
  },
  success: {
    color: 'success.emphasis',
    backgroundColor: 'success.subtle',
  },
  done: {
    color: 'done.emphasis',
    backgroundColor: 'done.subtle',
  },
}

export function GrowthBanner({
  children,
  closeButtonClick,
  icon,
  primaryButtonProps,
  secondaryButtonProps,
  showCloseButton = true,
  sx = {},
  title,
  variant = 'default',
  ...props
}: PropsWithChildren<GrowthBannerProps>) {
  const variantProps = variants[variant]
  const mergedSx: BetterSystemStyleObject = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'border.default',
    px: 3,
    py: 2,
    display: 'flex',
    flexDirection: ['column', 'column', 'row', 'row'],
    borderRadius: '6px',
    minHeight: '70px',
    position: 'relative',
    alignItems: ['flex-start', 'flex-start', 'center', 'center'],
    ...sx,
  }
  const iconVisible = !!icon
  return (
    <Box sx={mergedSx} {...props}>
      <Box sx={{display: 'flex', py: 2}}>
        {iconVisible && (
          <Box
            {...testIdProps('growth-GrowthBanner-icon')}
            sx={{
              width: '32px;',
              height: '32px;',
              borderRadius: '50%',
              bg: 'canvas.subtle',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              ...variantProps,
            }}
          >
            <Octicon icon={icon} size={16} />
          </Box>
        )}
        <Box sx={{mr: 3, ml: iconVisible ? 3 : 0}}>
          <Text sx={{fontWeight: 600, fontSize: '14px', margin: 0, lineHeight: '20px'}} as="p">
            {title}
          </Text>
          <Text as="span" sx={{fontSize: '12px', color: 'fg.muted', lineHeight: '18px', display: 'inline-block'}}>
            {children}
          </Text>
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          marginLeft: iconVisible ? ['48px', '48px', 'auto', 'auto'] : ['0', '0', 'auto', 'auto'],
          flexDirection: ['row-reverse', 'row-reverse', 'row', 'row'],
        }}
      >
        {secondaryButtonProps && <Button variant="invisible" sx={{marginRight: '8px'}} {...secondaryButtonProps} />}
        {primaryButtonProps && <Button sx={{marginRight: '8px'}} {...primaryButtonProps} />}
        {showCloseButton && (
          // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
          <IconButton
            unsafeDisableTooltip={true}
            variant="invisible"
            aria-label="Close GrowthBanner"
            onClick={closeButtonClick}
            icon={XIcon}
            size={'medium'}
            sx={{
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
