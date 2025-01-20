import {Box} from '@primer/react'
import {BorderBox} from '../../components/BorderBox'
import {StatusDatum} from './StatusDatum'
import {ReposDatum} from './ReposDatum'
import {TelemetryDatum} from './TelemetryDatum'
import {ActionsButton} from './ActionsButton'
import {CreatorDatum} from './CreatorDatum'

export function PipelineCard() {
  return (
    <BorderBox
      sx={{
        alignItems: 'start',
        borderRadius: '6px',
        display: 'flex',
        gap: '16px',
        justifyContent: 'space-between',
        px: '24px',
        py: '20px',
      }}
    >
      <Box sx={{alignItems: 'center', columnGap: '32px', display: 'flex', flexWrap: 'wrap', rowGap: '16px'}}>
        <CreatorDatum />
        <StatusDatum />
        <ReposDatum />
        <TelemetryDatum />
      </Box>

      <ActionsButton />
    </BorderBox>
  )
}
