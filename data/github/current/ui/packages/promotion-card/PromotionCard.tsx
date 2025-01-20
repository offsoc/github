import type {PropsWithChildren, MouseEventHandler} from 'react'
import {IconButton, type ButtonProps, Box, Heading, Text, Octicon, Button, useTheme} from '@primer/react'
import {type Icon, XIcon} from '@primer/octicons-react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {testIdProps} from '@github-ui/test-id-props'

export interface PromotionCardProps {
  /**
   * The title of the promotion card. This renders below the optional event icon and title.
   */
  title: string
  /**
   * The close button click handler
   */
  closeButtonClick?: MouseEventHandler<HTMLButtonElement>
  /**
   * The event icon. This renders to the left of the event title.
   */
  eventIcon?: Icon
  /**
   * The event title. This renders above the promotion card title.
   */
  eventTitle?: string
  /**
   * When defined, renders a primary button. You may pass any Primer Button props to this object.
   * To set Button text content, pass in a text value to the `children` prop
   */
  actionButtonProps?: ButtonProps

  /**
   * The dark image path. Used in place of an eventTitle and eventIcon. When defined, we render a dark
   * cover image when the user's theme resolves to a dark theme.
   */
  darkImagePath?: string

  /**
   * The light image path. Used in place of an eventTitle and eventIcon. When defined, we render a light
   * cover image when the user's theme resolves to a light theme.
   */
  lightImagePath?: string

  /**
   * Override any default CSS styles using the sx property. https://primer.style/react/overriding-styles
   */
  sx?: BetterSystemStyleObject
}

export function PromotionCard({
  title,
  closeButtonClick,
  eventIcon,
  eventTitle,
  actionButtonProps,
  children,
  sx = {},
  darkImagePath,
  lightImagePath,
  ...props
}: PropsWithChildren<PromotionCardProps>) {
  const mergedSx: BetterSystemStyleObject = {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'border.default',
    borderRadius: '6px',
    position: 'relative',
    flexDirection: 'column',
    gap: '16px',
    display: 'flex',
    p: 3,
    ...sx,
  }
  const showEventTitleAndIcon = !!eventTitle
  const showCoverImage = !!darkImagePath && !!lightImagePath && !showEventTitleAndIcon
  const {colorScheme: themeName} = useTheme()
  // We shouldn't need to match on the theme name. Please replace when we have a better way to do this.
  // resolvedColorMode cannot be depended on, since 'day' may map to a dark theme, and 'night' may map to a light theme.
  const imageSrc = themeName && /^dark/.test(themeName) ? darkImagePath : lightImagePath

  return (
    <Box sx={mergedSx} {...testIdProps('promotion-card')} {...props}>
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        icon={XIcon}
        aria-label={`Close ${eventTitle || title} promotion`}
        variant={'invisible'}
        onClick={closeButtonClick}
        sx={{position: 'absolute', top: '8px', right: '8px'}}
      />
      {showEventTitleAndIcon && (
        <Box sx={{display: 'flex', gap: '8px', alignItems: 'center'}}>
          {eventIcon && <Octicon icon={eventIcon} size={24} />}
          {eventTitle && (
            <Heading as="h3" sx={{fontSize: '20px'}} {...testIdProps('promotion-card-event-title')}>
              {eventTitle}
            </Heading>
          )}
        </Box>
      )}
      {showCoverImage && (
        <Box
          sx={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            height: 150,
            marginLeft: '-16px',
            marginRight: '-16px',
            marginTop: '-16px',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px',
          }}
          {...testIdProps('promotion-card-cover-image')}
        />
      )}
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        <Heading
          as={showEventTitleAndIcon ? 'h4' : 'h3'}
          sx={{fontSize: '14px', fontWeight: 600}}
          {...testIdProps('promotion-card-title')}
        >
          {title}
        </Heading>
        <Text as="p" sx={{color: 'fg.subtle', marginBottom: 0}}>
          {children}
        </Text>
      </Box>
      {actionButtonProps && <Button block {...actionButtonProps} {...testIdProps('promotion-card-action')} />}
    </Box>
  )
}
