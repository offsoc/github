import {testIdProps} from '@github-ui/test-id-props'
import {CounterLabel, TextInput} from '@primer/react'

type DisabledFilterInputProps = {
  query: string
  filterCount?: number
  icon?: React.ReactNode
}

export const DisabledFilterInput = ({query, filterCount, icon}: DisabledFilterInputProps) => {
  return (
    <TextInput
      aria-label="Filters"
      block
      disabled
      leadingVisual={icon}
      value={query}
      trailingVisual={
        filterCount !== undefined && (
          <CounterLabel {...testIdProps('disabled-filter-results-count')}>{filterCount}</CounterLabel>
        )
      }
    />
  )
}
