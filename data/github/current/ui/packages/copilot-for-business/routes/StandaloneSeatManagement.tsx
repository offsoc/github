import isEqual from 'lodash-es/isEqual'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {SelectableTable} from '../../copilot-for-business/standalone/components/SelectableTable'
import type {CopilotStandaloneSeatManagementPayload} from '../standalone/types'
import {StandaloneActionsBar} from '../../copilot-for-business/standalone/components/StandaloneActionsBar'
import {StandaloneBlankslate} from '../../copilot-for-business/standalone/components/StandaloneBlankslate'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useCreateFetcher} from '../hooks/use-fetchers'
import {SeatManagementContext} from '../standalone/hooks/use-seat-management-context'
import {PulseCheck} from '../../copilot-for-business/standalone/components/PulseCheck'
import {usePaginatedSearchQuery} from '../hooks/use-search-query'
import {AddSeatAssignmentsDialog} from '../../copilot-for-business/standalone/components/AddSeatAssignmentsDialog'
import {SelectionStateProvider} from '../../copilot-for-business/standalone/components/SelectionStateProvider'
import type {EnterpriseTeamSeatAssignment} from '../types'
import {EnterpriseTeamAssignment} from '../standalone/helpers/enterprise-team-assignment'
import {makeSelectedKey} from '../standalone/helpers/make-selected-key'
import {pluralize} from '../helpers/text'
import {standaloneSeatManagementEndpoint} from '../standalone/helpers/api-endpoints'

function SelectableTableHeader(props: Parameters<React.ComponentProps<typeof SelectableTable>['headerText']>[0]) {
  if (props.selectedCount > 0) {
    return <span data-testid="bulk-selected">{pluralize(props.selectedCount, 'team', 's')} selected</span>
  }

  return (
    <span data-testid="seat-management-selected-count">
      {pluralize(props.totalCount, 'team', 's')} with access to Copilot Business
    </span>
  )
}

export default function CopilotStandaloneSeatManagement() {
  const routeData = useRoutePayload<CopilotStandaloneSeatManagementPayload>()
  const {
    business: {slug},
  } = routeData
  const {currentPage, paginate, query, handleSearch, sortDetails, updateSortDetails, makeQueryString} =
    usePaginatedSearchQuery({initialSort: 'name_asc'})

  const useCopilotStandaloneFetcher = useCreateFetcher(standaloneSeatManagementEndpoint, {slug})
  const {data} = useCopilotStandaloneFetcher<{payload: CopilotStandaloneSeatManagementPayload}>({
    resource: `seat_management?${makeQueryString()}`,
    initialData: {payload: routeData},
  })

  const dataRef = useRef(data?.payload)
  const [payload, setPayload] = useState(data?.payload ?? routeData)

  useEffect(() => {
    if (data && dataRef.current && !isEqual(dataRef.current, data)) {
      setPayload(data.payload)
      dataRef.current = data.payload
    }
  }, [data])

  const seatManagementData = useMemo(
    () => ({
      payload,
      update: setPayload,
    }),
    [payload],
  )
  const hasExistingSeats = payload.count !== 0

  const [showAddTeamsUi, setShowAddTeamsUi] = useState(false)
  const handleShowAddTeamUi = useCallback(() => setShowAddTeamsUi(true), [setShowAddTeamsUi])
  const closeAddTeamsUi = useCallback(() => setShowAddTeamsUi(false), [setShowAddTeamsUi])

  return (
    <SeatManagementContext.Provider value={seatManagementData}>
      <PulseCheck slug={payload.business.slug} licenses={payload.total_seats} />
      {hasExistingSeats && <StandaloneActionsBar onSearch={handleSearch} onAddTeams={handleShowAddTeamUi} />}
      {!hasExistingSeats && <StandaloneBlankslate onAddTeams={handleShowAddTeamUi} />}
      {hasExistingSeats && (
        <SelectionStateProvider<EnterpriseTeamSeatAssignment>
          selectionState={{
            selectables: payload.seatAssignments,
            total: payload.count,
            key: makeSelectedKey,
            filters: [EnterpriseTeamAssignment.isSelectable],
          }}
        >
          <SelectableTable
            query={query}
            paginate={paginate}
            currentPage={currentPage}
            sortDetails={sortDetails}
            setSortDetails={updateSortDetails}
            items={payload.seatAssignments}
            headerText={SelectableTableHeader}
            denySelectionFilters={[EnterpriseTeamAssignment.isPendingCancellation]}
          />
        </SelectionStateProvider>
      )}
      {showAddTeamsUi && <AddSeatAssignmentsDialog isOpen={showAddTeamsUi} onClose={closeAddTeamsUi} />}
    </SeatManagementContext.Provider>
  )
}
