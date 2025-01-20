import {Box} from '@primer/react'

type SectionProps = {
  children: React.ReactNode
}

function Section({children}: SectionProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {children}
    </Box>
  )
}

export default Section
