import type {SxProp} from '@primer/react'
import {forwardRef} from 'react'

import {DropdownCaret} from '../../common/dropdown-caret'
import {BaseCell} from './base-cell'

export const DropdownCell = forwardRef<HTMLButtonElement, React.PropsWithChildren<SxProp> & {isDisabled?: boolean}>(
  ({children, isDisabled}, ref) => {
    return (
      <BaseCell
        sx={{
          paddingRight: '4px',
          alignItems: 'center',
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'space-between',
        }}
        disallowSelection
      >
        {children}
        {isDisabled ? null : <DropdownCaret ref={ref} sx={{mx: 1}} />}
      </BaseCell>
    )
  },
)

DropdownCell.displayName = 'DropdownCell'
