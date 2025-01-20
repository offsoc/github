import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

interface Props {
  color: string
  sx?: BetterSystemStyleObject
}

export default function ColoredBullet(props: Props) {
  return <Box sx={{borderRadius: '100px', width: '8px', height: '8px', backgroundColor: props.color, ...props.sx}} />
}
