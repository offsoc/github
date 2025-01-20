import {Heading, type SxProp} from '@primer/react'
import {useContext, useEffect} from 'react'
import {getNodeText} from '../shared'
import ChartCardContext from './context'

export type TitleProps = {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  children: React.ReactNode
} & SxProp

export function Title({as = 'h3', sx = {}, children}: TitleProps) {
  const {setTitle, size} = useContext(ChartCardContext)
  useEffect(() => {
    setTitle(getNodeText(children))
  }, [setTitle, children])
  return size !== 'sparkline' ? (
    <Heading sx={{fontSize: 2, fontWeight: 600, ...sx}} as={as}>
      {children}
    </Heading>
  ) : null
}
Title.displayName = 'ChartCard.Title'
