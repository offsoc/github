import {Box} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo} from 'react'

import {GROUP_SEPARATOR_HEIGHT} from './constants'

const tableGroupSeparatorStyles: BetterSystemStyleObject = {
  backgroundColor: 'canvas.inset',
  zIndex: -1,
  padding: 0,
  height: `${GROUP_SEPARATOR_HEIGHT}px`,
  display: 'flex',
  '&:last-child': {
    flexGrow: 1,
  },
}

export const TableGroupSeparator = memo(function TableGroupSeparator() {
  return <Box sx={tableGroupSeparatorStyles} />
})
