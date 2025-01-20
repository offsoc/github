import {Box} from '@primer/react'

interface SectionContentProps {
  children: React.ReactNode
  variant?: string
  primaryButtonTitle?: string
  secondaryButtonTitle?: string
  isDirty?: boolean
}

const SectionContent = ({variant = 'default', children}: SectionContentProps) => {
  return (
    <>
      {variant === 'form' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {children}
        </Box>
      )}
      {variant !== 'form' && (
        <CardContainer>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: variant === 'form' ? 3 : 2,
            }}
          >
            {children}
          </Box>
        </CardContainer>
      )}
    </>
  )
}

type CardContainerProps = {
  children: React.ReactNode
  as?: React.ElementType
}

const CardContainer = ({children, as = 'div'}: CardContainerProps) => {
  return (
    <Box
      as={as}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        marginBottom: 2,
      }}
    >
      {children}
    </Box>
  )
}

export default SectionContent
