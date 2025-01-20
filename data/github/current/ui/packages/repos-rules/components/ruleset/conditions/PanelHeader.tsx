import {Pagehead, Text} from '@primer/react'
import type {FC} from 'react'

interface PanelHeaderProps {
  title: string
  subtitle: string
}

export const PanelHeader: FC<PanelHeaderProps> = ({title, subtitle}) => {
  return (
    <>
      <Pagehead sx={{pb: 2, mb: 2, fontSize: 4, fontWeight: 'normal'}}>{title}</Pagehead>
      <Text sx={{color: 'fg.muted'}}>{subtitle}</Text>
    </>
  )
}
