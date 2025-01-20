import {Box, Button, Spinner} from '@primer/react'
import {FileIcon} from '@primer/octicons-react'
import {ActionsBar} from './ActionsBar'
import {FilterableSearch} from './FilterableSearch'
import {useSeatManagementContext} from '../hooks/use-seat-management-context'
import {useCreateCSV} from '../../hooks/use-create-csv'
import {standaloneCSVEndpoint} from '../helpers/api-endpoints'

type Props = {
  onSearch: (value: string) => void
  onAddTeams: () => void
}

export function StandaloneActionsBar({onSearch, onAddTeams}: Props) {
  const {payload} = useSeatManagementContext()
  const {loading, makeCSVRequest} = useCreateCSV({slug: payload.business.slug, endpoint: standaloneCSVEndpoint})

  return (
    <section aria-label="Management actions">
      <ActionsBar>
        <ActionsBar.LeftAction>
          <Box sx={{width: '25%'}}>
            <Box sx={{display: 'flex'}}>
              <FilterableSearch placeholder="Filter enterprise teams" search={onSearch} />
            </Box>
          </Box>
        </ActionsBar.LeftAction>
        <ActionsBar.RightAction>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            {loading && <Spinner sx={{marginRight: 2}} size="small" aria-label="Loading a csv report" />}
            <Button className="mr-2" leadingVisual={FileIcon} onClick={makeCSVRequest} name="get report">
              Get report
            </Button>
            <Button variant="primary" onClick={onAddTeams}>
              Add teams
            </Button>
          </Box>
        </ActionsBar.RightAction>
      </ActionsBar>
    </section>
  )
}
