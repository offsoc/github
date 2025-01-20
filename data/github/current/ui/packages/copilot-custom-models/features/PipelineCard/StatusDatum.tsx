import {Box, Octicon} from '@primer/react'
import type {PipelineStatus} from '../../types'
import {Datum} from './Datum'
import {CheckCircleFillIcon, StopIcon, XCircleFillIcon} from '@primer/octicons-react'
import {deployedText, statusTextMap} from '../../utils'
import {DatumText} from './DatumText'
import {RadarCircle} from '../../components/RadarCircle'
import {usePipelineDetails} from '../PipelineDetails'

type IconMap = Record<PipelineStatus, JSX.Element>

const iconMap: IconMap = {
  PIPELINE_STATUS_UNSPECIFIED: <RadarCircle aria-label="Unspecified" size={16} />,
  PIPELINE_STATUS_ENQUEUED: <RadarCircle aria-label="Enqueued" size={16} />,
  PIPELINE_STATUS_STARTED: <RadarCircle aria-label="Started" size={16} />,
  PIPELINE_STATUS_COMPLETED: (
    <Octicon
      aria-label="Completed"
      icon={CheckCircleFillIcon}
      size={16}
      sx={{color: 'var(--fgColor-success, var(--color-success-fg))'}}
    />
  ),
  PIPELINE_STATUS_FAILED: (
    <Octicon
      aria-label="Failed"
      icon={XCircleFillIcon}
      size={16}
      sx={{color: 'var(--fgColor-danger, var(--color-danger-fg))'}}
    />
  ),
  PIPELINE_STATUS_CANCELING: <Octicon aria-label="Canceling" icon={StopIcon} size={16} />,
  PIPELINE_STATUS_CANCELED: <Octicon aria-label="Canceled" icon={StopIcon} size={16} />,
  PIPELINE_STATUS_INACTIVE: <Octicon aria-label="Inactive" icon={StopIcon} size={16} />,
  PIPELINE_STATUS_DELETING: <Octicon aria-label="Deleting" icon={StopIcon} size={16} />,
  PIPELINE_STATUS_DELETED: <Octicon aria-label="Deleted" icon={StopIcon} size={16} />,
}

export function StatusDatum() {
  const {
    cardPipeline: {isDeployed, status},
  } = usePipelineDetails()
  const icon = iconMap[status]
  const text = isDeployed ? deployedText : statusTextMap[status]

  return (
    <Datum
      name="Status"
      value={
        <Box sx={{alignItems: 'center', display: 'flex', gap: '4px'}}>
          {icon}
          <DatumText>{text}</DatumText>
        </Box>
      }
    />
  )
}
