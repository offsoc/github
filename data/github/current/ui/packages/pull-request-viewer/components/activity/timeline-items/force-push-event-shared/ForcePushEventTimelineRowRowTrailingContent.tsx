import {Box, Link} from '@primer/react'

export function ForcePushEventTimelineRowTrailingContent({compareUrl}: {compareUrl: string}) {
  return (
    <Box sx={{mt: '2px', mr: -5, ml: 2}}>
      <Link href={compareUrl}>Compare</Link>
    </Box>
  )
}
