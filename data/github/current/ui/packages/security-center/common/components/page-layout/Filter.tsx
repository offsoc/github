import {Filter as UiFilter, type FilterProvider} from '@github-ui/filter'
import {useEffect, useState} from 'react'

type Props = {
  providers: FilterProvider[]
  query: string
  onSubmit: (query: string) => void
}

function Filter({providers, query, onSubmit}: Props): JSX.Element {
  // state of the filter input control, before it is submitted
  const [filterValue, setFilterValue] = useState(query)

  // if the prop changes externally, update our state (e.g. on filter revert)
  useEffect(() => {
    setFilterValue(query)
  }, [query])

  return (
    <UiFilter
      id="security-overview-page-filter"
      label="Filter"
      placeholder="Filter"
      sx={{flexGrow: 1}}
      providers={providers}
      filterValue={filterValue}
      onChange={setFilterValue}
      onSubmit={request => onSubmit(request.raw)}
    />
  )
}

Filter.displayName = 'PageLayout.Filter'

export default Filter
