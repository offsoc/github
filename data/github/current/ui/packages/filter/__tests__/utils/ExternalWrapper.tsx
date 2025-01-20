import {useMemo, useState} from 'react'

import {Filter, FilterRevert} from '../../Filter'
import {StateFilterProvider} from '../../providers'

export const ExternalWrapper = () => {
  const startingValue = ''
  const [filterValue, setFilterValue] = useState(startingValue)
  const providers = useMemo(() => [new StateFilterProvider('mixed')], [])

  return (
    <>
      <Filter
        id="test-filter"
        context={{repo: 'github/github'}}
        label="Filter items"
        filterValue={filterValue}
        providers={providers}
        onChange={(value: string) => {
          setFilterValue(value)
        }}
      />
      <FilterRevert
        href="#"
        sx={{mt: 1}}
        onClick={e => {
          setFilterValue(startingValue)
          e.preventDefault()
        }}
      />
    </>
  )
}
