import {ActionList, Box} from '@primer/react'
import {TimeFilter} from '@github-ui/action-menu-selector/TimeFilter'
import {useMemo} from 'react'
import type {FC} from 'react'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import type {DelegatedBypassFilter, SourceType} from '../delegated-bypass-types'
import {requestsIndexPath} from '../helpers/requests-filter'
import {orderedStatuses, requestStatuses} from '../helpers/constants'
import {UserSelector} from '@github-ui/user-selector'
import {useBypassActors} from '../hooks/use-bypass-actors'
import {ActionMenuSelector} from '@github-ui/action-menu-selector'
import {ReposSelector, simpleRepoLoader} from '@github-ui/repos-selector'

type BypassRequestsFilterProps = {
  sourceType: SourceType
  filter: DelegatedBypassFilter
  repositories?: string[]
}

export const BypassRequestsFilterBar: FC<BypassRequestsFilterProps> = ({filter, sourceType, repositories}) => {
  const {approver, requester, timePeriod, requestStatus, repository} = filter
  const {navigate} = useRelativeNavigation()
  const updateFilter = (newFilter: DelegatedBypassFilter) => {
    newFilter.page = undefined // Reset to first page when filter changes
    navigate('.', requestsIndexPath({filter: newFilter}), true)
  }
  const requestersState = useBypassActors('Requester')
  const approversState = useBypassActors('Approver')
  const namedRepos = useMemo(() => repositories?.map(r => ({name: r})) || [], [repositories])

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}} className="mb-3">
      {sourceType === 'organization' && (
        <div className="d-flex p-1">
          <ReposSelector
            currentSelection={repository ? {name: repository} : undefined}
            repositoryLoader={simpleRepoLoader(namedRepos)}
            selectAllOption={true}
            selectionVariant="single"
            onSelect={selectedRepository => {
              if (selectedRepository?.name !== repository) {
                updateFilter({...filter, repository: selectedRepository?.name})
              }
            }}
          />
        </div>
      )}
      <div className="d-flex p-1">
        <UserSelector
          defaultText="All approvers"
          usersState={approversState}
          currentUser={approver}
          onSelect={selectedUser => {
            if (selectedUser !== approver) {
              updateFilter({...filter, approver: selectedUser})
            }
          }}
          renderCustomFooter={() => (
            <ActionList.Item
              onSelect={() => {
                updateFilter({...filter, approver: undefined})
              }}
            >
              All approvers
            </ActionList.Item>
          )}
          label="Approver: "
        />
      </div>
      <div className="d-flex p-1">
        <UserSelector
          defaultText="All requesters"
          usersState={requestersState}
          currentUser={requester}
          onSelect={selectedUser => {
            if (selectedUser !== requester) {
              updateFilter({...filter, requester: selectedUser})
            }
          }}
          renderCustomFooter={() => (
            <ActionList.Item
              onSelect={() => {
                updateFilter({...filter, requester: undefined})
              }}
            >
              All requesters
            </ActionList.Item>
          )}
          label="Requester: "
        />
      </div>
      <div className="d-flex p-1">
        <TimeFilter
          currentTimePeriod={timePeriod || 'day'}
          onSelect={selectedTimePeriod => {
            if (selectedTimePeriod !== timePeriod) {
              updateFilter({...filter, timePeriod: selectedTimePeriod})
            }
          }}
        />
      </div>
      <div className="d-flex p-1">
        <ActionMenuSelector
          currentSelection={requestStatus || 'all'}
          orderedValues={orderedStatuses}
          displayValues={requestStatuses}
          onSelect={selectedBypassStatus => {
            if (selectedBypassStatus !== requestStatus) {
              updateFilter({...filter, requestStatus: selectedBypassStatus})
            }
          }}
        />
      </div>
    </Box>
  )
}
