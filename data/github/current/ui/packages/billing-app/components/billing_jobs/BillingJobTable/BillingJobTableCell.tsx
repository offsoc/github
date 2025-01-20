import {Box, Button} from '@primer/react'

import {cellStyle} from './style'

interface Props {
  text: string
  style?: {[key: string]: string | number | undefined}
  onClick?: () => void
}

export type BillingJobTableCellData =
  | string
  | {
      text: string
      style?: {[key: string]: string | number | undefined}
      onClick?: () => void
    }

export default function BillingJobTableCell({text, style = {}, onClick}: Props) {
  if (!style.width && !style.flex) style.flex = 1

  return <Box sx={{...cellStyle, ...style}}>{onClick ? <Button onClick={onClick}>{text}</Button> : text}</Box>
}
