import {LoadingSkeleton} from '@github-ui/skeleton/LoadingSkeleton'
import {Box} from '@primer/react'

import {MESSAGES} from '../../../constants/messages'
import SelectTeamsFooter from './SelectTeamsFooter'
import {SelectTeamsQueryLoading} from './SelectTeamsQueryLoading'

type SelectTeamsLoadingProps = {
  nrRows?: number
  onCancel: () => void
}

export const SelectTeamsLoading = ({nrRows, onCancel}: SelectTeamsLoadingProps): JSX.Element => {
  return (
    <>
      <Box
        sx={{
          maxHeight: '340px',
          minHeight: '145px',
          overflowY: 'auto',
        }}
      >
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 2, p: 3, pb: 0}}>
            <LoadingSkeleton variant="rounded" height="xl" width="30%" />
            <LoadingSkeleton variant="rounded" height="xl" width="70%" />
          </Box>
          <SelectTeamsQueryLoading nrRows={nrRows} />
        </Box>
      </Box>
      <SelectTeamsFooter onCancel={onCancel} leadingText={MESSAGES.nrSelectedTeams(0)} />
    </>
  )
}
