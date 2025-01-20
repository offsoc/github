import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {Datum} from './Datum'
import {DatumText} from './DatumText'
import {usePipelineDetails} from '../PipelineDetails'

export function TelemetryDatum() {
  const {
    cardPipeline: {wasPrivateTelemetryCollected},
  } = usePipelineDetails()

  const isPrivateTelemetryFlagEnabled = useFeatureFlag('copilot_private_telemetry_access')

  if (!isPrivateTelemetryFlagEnabled) return null

  const value = wasPrivateTelemetryCollected ? 'On' : 'Off'

  return <Datum name="Telemetry" value={<DatumText>{value}</DatumText>} />
}
