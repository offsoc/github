import {Box} from '@primer/react'

type ControlGroupContainerProps = {
  children: React.ReactNode
  border?: boolean
  fullWidth?: boolean
  ['data-testid']?: string
}

const ControlGroupContainer = ({
  children,
  fullWidth = false,
  border = true,
  'data-testid': testId,
}: ControlGroupContainerProps) => {
  return (
    <Box
      sx={{
        '--link-item-padding': fullWidth ? 'var(--base-size-12)' : 0,
        '--link-item-margin': fullWidth ? 'calc(var(--base-size-12) * -1)' : 0,
        borderRadius: 2,
        backgroundColor: 'canvas.default',
        border: '1px solid',
        borderColor: border ? 'border.muted' : 'transparent',
        // The lobotomized owl selector: Add border-top to all direct children except the first one
        '> * + * > *': {
          borderTop: '1px solid',
          borderColor: 'border.muted',
        },
        '> :first-child, > :first-child > :first-child ': {
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        },
        '> :last-child, > :last-child > :last-child': {
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
        },
      }}
      data-testid={testId}
    >
      {children}
    </Box>
  )
}

export default ControlGroupContainer
