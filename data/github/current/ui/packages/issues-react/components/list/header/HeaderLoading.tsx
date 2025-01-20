import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box, Heading} from '@primer/react'

import {BUTTON_LABELS} from '../../../constants/buttons'
import {TEST_IDS} from '../../../constants/test-ids'

export const HeaderLoading = () => {
  return (
    <Box sx={{px: 0}} data-testid={TEST_IDS.headerLoading}>
      <Box sx={{mb: 2}}>
        <Heading as="h1" sx={{fontSize: 3}}>
          {BUTTON_LABELS.issues}
        </Heading>
      </Box>
      <LoadingSkeleton variant="rounded" height="xl" width="150px" />
    </Box>
  )
}
