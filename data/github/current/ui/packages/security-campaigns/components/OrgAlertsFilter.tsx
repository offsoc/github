import {Filter, type FilterProvider} from '@github-ui/filter'
import {Box} from '@primer/react'
import {useEffect, useState} from 'react'

export type OrgAlertsFilterPayload = {
  providers: FilterProvider[]
  query: string
  setQuery: (query: string) => void
}

export const OrgAlertsFilter = ({providers, query, setQuery}: OrgAlertsFilterPayload) => {
  const [filterValue, setFilterValue] = useState(query)

  useEffect(() => {
    setFilterValue(query)
  }, [query])

  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', gap: '1em'}}>
      <Filter
        id="security-campaign-org-alerts-filter"
        label="Filter"
        placeholder="Filter"
        sx={{flexGrow: 1}}
        providers={providers}
        filterValue={filterValue}
        onChange={setFilterValue}
        onSubmit={request => setQuery(request.raw)}
      />
    </Box>
  )
}
