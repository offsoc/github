import {createContext, type RefObject} from 'react'
import type {HighchartsReactRefObject} from 'highcharts-react-official'
import type {Size} from '../shared'

export interface ContextProps {
  title: string
  setTitle: (title: string) => void
  description: string
  setDescription: (description: string) => void
  size: Size
  chartRef: RefObject<HighchartsReactRefObject>
}

export default createContext<ContextProps>({} as ContextProps)
