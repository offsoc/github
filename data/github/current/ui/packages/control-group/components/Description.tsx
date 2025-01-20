import {Box, Text} from '@primer/react'

type DescriptionProps = {
  children: React.ReactNode | string
}

const Description = ({children}: DescriptionProps) => {
  if (typeof children === 'string') {
    return (
      <Text as="p" sx={{font: 'var(--text-body-shorthand-small)', lineHeight: 1.5, color: 'fg.muted', margin: 0}}>
        {children}
      </Text>
    )
  }

  return (
    <Box as="span" sx={{font: 'var(--text-body-shorthand-small)', color: 'fg.muted'}}>
      {children}
    </Box>
  )
}
Description.displayName = 'ControlGroup.Description'

export default Description
