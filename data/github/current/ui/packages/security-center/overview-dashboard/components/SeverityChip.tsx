import {Label} from '@primer/react'

interface Props {
  severity: string
}

export default function SeverityChip({severity}: Props): JSX.Element | null {
  if (severity === undefined) {
    return <>-</>
  }

  const newSeverity = severity.toLowerCase().trim()

  switch (newSeverity) {
    case 'critical':
      return <Label variant="danger">Critical</Label>
    case 'high':
      return <Label variant="severe">High</Label>
    case 'medium':
    case 'moderate':
      return <Label variant="attention">Medium</Label>
    case 'low':
      return <Label variant="primary">Low</Label>
  }

  return null
}
