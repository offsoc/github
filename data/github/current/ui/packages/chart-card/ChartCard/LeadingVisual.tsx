import {useContext} from 'react'
import ChartCardContext from './context'

export interface LeadingVisualProps {
  children: React.ReactNode
}

export function LeadingVisual({children}: LeadingVisualProps) {
  const {size} = useContext(ChartCardContext)
  return size !== 'sparkline' ? <>{children}</> : null
}
LeadingVisual.displayName = 'ChartCard.LeadingVisual'
