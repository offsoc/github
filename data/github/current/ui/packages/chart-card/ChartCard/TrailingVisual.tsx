import {useContext} from 'react'
import ChartCardContext from './context'

export interface TrailingVisualProps {
  children: React.ReactNode
}

export function TrailingVisual({children}: TrailingVisualProps) {
  const {size} = useContext(ChartCardContext)
  return size !== 'sparkline' ? <>{children}</> : null
}
TrailingVisual.displayName = 'ChartCard.TrailingVisual'
