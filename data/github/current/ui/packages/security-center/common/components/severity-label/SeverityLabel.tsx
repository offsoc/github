import {Label} from '@primer/react'

interface Props {
  severity: 'critical' | 'high' | 'medium' | 'low' | string
}

function toTitleCase(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

// TODO consolidate with overview-dashboard/components/SeverityChip
export default function SeverityLabel({severity}: Props): JSX.Element {
  switch (severity.toLowerCase()) {
    case 'critical':
      return <Label variant="danger">Critical</Label>
    case 'high':
      return <Label variant="severe">High</Label>
    case 'medium':
      return <Label variant="attention">Medium</Label>
    case 'low':
      return <Label variant="primary">Low</Label>
    default:
      return <Label>{toTitleCase(severity)}</Label>
  }
}
