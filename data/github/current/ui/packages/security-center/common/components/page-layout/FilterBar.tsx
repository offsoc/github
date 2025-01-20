import {Box} from '@primer/react'
import type {PropsWithChildren, ReactElement} from 'react'

import type DatePicker from './DatePicker'
import type Filter from './Filter'
import type FilterRevert from './FilterRevert'

interface Props {
  filter: ReactElement<typeof Filter>
  datePicker?: ReactElement<typeof DatePicker>
  revert: ReactElement<typeof FilterRevert>
}

function FilterBar(props: PropsWithChildren<Props>): JSX.Element {
  return (
    <Box sx={{flexGrow: 1}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: '1em'}}>
        {props.filter}
        {props.children}
        {props.datePicker}
      </Box>
      {props.revert}
    </Box>
  )
}

FilterBar.displayName = 'PageLayout.FilterBar'

export default FilterBar
