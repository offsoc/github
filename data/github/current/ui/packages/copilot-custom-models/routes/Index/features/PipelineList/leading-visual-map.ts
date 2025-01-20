import type {PipelineStatus} from '../../../../types'
import {CheckCircleFillIcon, CheckCircleIcon, StopIcon, XCircleFillIcon} from '@primer/octicons-react'
import {RadarCircle} from '../../../../components/RadarCircle'
import type {OcticonProps} from '@primer/react'

type Icon = OcticonProps['icon']

interface LeadingVisual {
  color?: string
  icon: Icon
  label: string
}
type LeadingVisualMap = Record<PipelineStatus, LeadingVisual>

export const leadingVisualMap: LeadingVisualMap = {
  PIPELINE_STATUS_UNSPECIFIED: {
    icon: RadarCircle,
    label: 'Unspecified',
  },
  PIPELINE_STATUS_ENQUEUED: {
    icon: RadarCircle,
    label: 'Enqueued',
  },
  PIPELINE_STATUS_STARTED: {
    icon: RadarCircle,
    label: 'Started',
  },
  PIPELINE_STATUS_COMPLETED: {
    color: 'var(--fgColor-muted, var(--color-fg-muted))',
    icon: CheckCircleIcon,
    label: 'Completed',
  },
  PIPELINE_STATUS_FAILED: {
    color: 'var(--fgColor-danger, var(--color-danger-fg))',
    icon: XCircleFillIcon,
    label: 'Failed',
  },
  PIPELINE_STATUS_CANCELING: {
    icon: StopIcon,
    label: 'Canceling',
  },
  PIPELINE_STATUS_CANCELED: {
    icon: StopIcon,
    label: 'Canceled',
  },
  PIPELINE_STATUS_INACTIVE: {
    icon: StopIcon,
    label: 'Inactive',
  },
  PIPELINE_STATUS_DELETING: {
    icon: StopIcon,
    label: 'Deleting',
  },
  PIPELINE_STATUS_DELETED: {
    icon: StopIcon,
    label: 'Deleted',
  },
}

export const deployedLeadingVisual: LeadingVisual = {
  color: 'var(--fgColor-success, var(--color-success-fg))',
  icon: CheckCircleFillIcon,
  label: 'Deployed',
}
