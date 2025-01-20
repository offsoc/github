import {Box} from '@primer/react'
import {useState} from 'react'
import {Filter, type FilterProvider} from '@github-ui/filter'

import {AssigneeFilterProvider, AuthorFilterProvider, UserFilterProvider} from '@github-ui/filter/providers'

export default function ExampleFilter() {
  const [filterValue, setFilterValue] = useState('assignee:@me')
  return (
    <Box sx={{display: 'flex', width: '100%', flexDirection: 'column'}}>
      <Filter
        id="storybook-filter"
        label="Filter items"
        filterValue={filterValue}
        providers={defaultProviders}
        onChange={(value: string) => setFilterValue(value)}
      />
    </Box>
  )
}

const defaultUserObject = {
  currentUserLogin: 'monalisa',
  currentUserAvatarUrl: 'https://avatars.githubusercontent.com/u/90914?v=4',
}

const defaultProviders: FilterProvider[] = [
  new AssigneeFilterProvider(defaultUserObject),
  new AuthorFilterProvider(defaultUserObject, {filterTypes: {multiKey: false}}),
  new UserFilterProvider(defaultUserObject),
]
