import type {Icon} from '@primer/octicons-react'
import {Box, type BoxProps, themeGet} from '@primer/react'
import type {PropsWithChildren, ReactNode} from 'react'

import {BlankslateErrorMessage} from '../../../../components/error-boundaries/blankslate-error-message'

interface MissingChartErrorProps extends Omit<BoxProps, 'content'> {
  icon?: Icon
  heading: ReactNode
  content: ReactNode
}

export const BaseChartError: React.FC<PropsWithChildren<MissingChartErrorProps>> = ({
  icon,
  heading,
  content,
  children,
  ...props
}) => {
  return (
    <Box
      sx={{
        backgroundColor: theme => `${theme.colors.canvas.subtle}`,
        maxWidth: themeGet('sizes.large'),
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        borderRadius: '6px',
        p: 5,
      }}
      {...props}
    >
      <BlankslateErrorMessage icon={icon} heading={heading} content={content}>
        {children}
      </BlankslateErrorMessage>
    </Box>
  )
}
