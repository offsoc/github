import type React from 'react'
import {Label} from '@primer/react'

const RowLabel: React.FC<{text: string}> = ({text}) => {
  return (
    <Label sx={{mx: 2}} variant="secondary">
      {text}
    </Label>
  )
}

export default RowLabel
