import {Text} from '@primer/react'

export const selectorDropdownButtonStyles = {
  flex: 1,
  gridTemplateColumns: 'min-content 1fr min-content',
  textAlign: 'left',
  width: '100%',
  '[data-component=buttonContent]': {flex: 0},
}

// Setting the width because the dropdown in rendered in a portal, 400 (bar width) - 24x2 (x padding) - 1 (border)
export const selectorDropdownOverlayStyles = {width: `${400 - 24 * 2 + 1}px`}

export const SelectorLabel = ({children, sx, ...props}: React.ComponentProps<typeof Text>) => (
  <Text sx={{display: 'flex', mb: 2, fontWeight: 'semibold', ...sx}} {...props}>
    {children}
  </Text>
)
