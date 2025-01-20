import {Box} from '@primer/react'

import type {Label} from '../../../api/common-contracts'
import {LabelToken} from '../../fields/label-token'
import {DropdownCell} from './dropdown-cell'

interface LabelGroupProps {
  labels: Array<Label> | undefined
  dropdownRef?: React.MutableRefObject<HTMLButtonElement | null>
  isDisabled?: boolean
}

export const LabelGroup: React.FC<LabelGroupProps> = ({labels, dropdownRef, isDisabled}) => {
  return (
    <DropdownCell ref={dropdownRef} isDisabled={isDisabled}>
      <Box sx={{overflow: 'hidden', display: 'flex', gap: 1}}>
        {labels?.map(label => <LabelToken key={label.id} label={label} />)}
      </Box>
    </DropdownCell>
  )
}
