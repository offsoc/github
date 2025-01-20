import {Box} from '@primer/react'

export function ArchiveHeaderWrapper({children}: {children: React.ReactNode}) {
  return (
    <Box
      sx={{
        marginTop: 3,
        bg: 'canvas.subtle',
        border: '1px solid',
        borderColor: 'border.default',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
      }}
    >
      <Box
        sx={{
          p: 2,
          pl: 4,
          pr: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '50px',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
