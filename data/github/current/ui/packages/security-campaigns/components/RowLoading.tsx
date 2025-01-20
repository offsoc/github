import {Box} from '@primer/react'
import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'

export function RowLoading(): JSX.Element {
  function randomLabelWidth(): string {
    const min = 40
    const max = 60
    const randomWidth = Math.floor(Math.random() * (max - min + 1) + min)
    return `${randomWidth}%`
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '8px',
          paddingX: '12px',
          paddingY: '8px',
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderBottomColor: 'border.muted',
        }}
      >
        <LoadingSkeleton variant="elliptical" height="md" width="md" />
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <LoadingSkeleton variant="rounded" height="sm" width={randomLabelWidth()} />
          <LoadingSkeleton variant="rounded" height="12px" width={randomLabelWidth()} sx={{marginTop: '8px'}} />
        </Box>
      </Box>
    </>
  )
}
