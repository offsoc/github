import {type TestIdProps, testIdProps} from '@github-ui/test-id-props'
import type {Icon} from '@primer/octicons-react'
import {Box, Heading, Octicon} from '@primer/react'

type AutomationBlockProps = {
  icon?: Icon
  iconBg?: string
  iconColor?: string
  headerDescription?: string
  children?: React.ReactNode
} & TestIdProps

export const AutomationBlock = ({
  icon,
  iconBg,
  iconColor,
  headerDescription,
  children,
  ...props
}: AutomationBlockProps) => {
  return (
    <Box
      sx={{
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'border.subtle',
        borderRadius: 2,
        backgroundColor: 'canvas.default',
        width: '100%',
        transition: 'border-color 0.3s ease-out',
        boxShadow: 'shadow.medium',
      }}
      {...testIdProps('automation-block')}
      {...props}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            borderBottom: children ? '1px solid' : 'none',
            borderBottomColor: 'border.subtle',
          }}
        >
          {icon && (
            <Box
              sx={{
                bg: iconBg,
                borderRadius: '4px',
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Octicon icon={icon} sx={{color: iconColor}} />
            </Box>
          )}
          {headerDescription && (
            <Heading as="h3" sx={{fontSize: 1, color: 'fg.default', ml: 2}}>
              {headerDescription}
            </Heading>
          )}
        </Box>
        {children && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              flex: 'auto',
              alignItems: 'center',
              m: 3,
            }}
          >
            {children}
          </Box>
        )}
      </Box>
    </Box>
  )
}
