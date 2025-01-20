import type React from 'react'
import {Box, Checkbox, Pagination, Button} from '@primer/react'
import {useState, useMemo, useCallback} from 'react'
import type {EnterpriseTeamSeatAssignment, SortName} from '../../types'
import {useSeatManagementContext} from '../hooks/use-seat-management-context'
import {EnterpriseTeamAssignment} from '../helpers/enterprise-team-assignment'
import {RemoveTeamAssignmentsDialog} from './RemoveTeamAssignmentsDialog'
import type {
  EnterpriseTeamAssignable,
  CopilotStandaloneSeatManagementPayload,
  EnterpriseTeamAssignables,
} from '../types'
import {useCancelSeatAssignment} from '../hooks/use-cancel-seat-assignment'
import {useCreateSeatAssignment} from '../hooks/use-create-seat-assignment'
import {TrashIcon} from '@primer/octicons-react'
import {SelectableTableRow} from './SelectableTableRow'
import {AssignablesSort} from './AssignablesSort'
import {useSelectionStateContext} from '../hooks/use-selection-state-context'
import {NoSearchResultsBlankslate} from './NoSearchResultsBlankslate'

type HeaderTextProps = {selectedCount: number; totalCount: number}

type Props = React.PropsWithChildren<{
  query: string
  paginate: (page: number) => void
  currentPage: number
  sortDetails: SortName
  setSortDetails: (sort: SortName) => void
  headerText: ({selectedCount, totalCount}: HeaderTextProps) => React.ReactNode
  items?: EnterpriseTeamSeatAssignment[]
  withDelete?: boolean
  withRowActions?: boolean
  denySelectionFilters?: Array<(value: EnterpriseTeamSeatAssignment) => boolean>
  statusInfo?: (props: React.PropsWithChildren<object>) => JSX.Element
}>

const PAGE_SIZE = 25
const SORT_OPTIONS: SortName[] = ['name_asc', 'name_desc', 'member_count_asc', 'member_count_desc']

export function SelectableTable(props: Props) {
  const {payload, update} = useSeatManagementContext()
  const {seatAssignments: assignments, count, filtered_count, business} = payload
  const owner = business.slug
  const seatAssignments = props.items ?? assignments
  const {withDelete = true, query, denySelectionFilters = []} = props
  const {selectionState} = useSelectionStateContext()
  const {checkCount, allChecked, isIndeterminate, checkOne, checkAll, uncheckAll, isChecked, selectedItems} =
    selectionState

  const {confirmCancellation, rejectConfirmation, cancellationError, pendingConfirmation, beginCancel} =
    useCancelSeatAssignment<CopilotStandaloneSeatManagementPayload>({
      owner,
      onComplete: nextPayload => {
        update(nextPayload)
        uncheckAll()
        setTargetAssignment(null)
      },
    })
  const {createAssignment} = useCreateSeatAssignment<CopilotStandaloneSeatManagementPayload>({
    owner,
    onComplete: nextPayload => {
      update(nextPayload)
      uncheckAll()
      setTargetAssignment(null)
    },
  })

  const anyChecked = checkCount > 0
  const anySelectable = seatAssignments.some(EnterpriseTeamAssignment.isSelectable)

  const handleCheck = useCallback(
    (selectable: EnterpriseTeamSeatAssignment) => {
      return () => {
        checkOne(selectable)
        setTargetAssignment(null)
      }
    },
    [checkOne],
  )

  // This function is responsible for storing the current row that the
  // user is interacting with when unassigning a seat assignment via the
  // kebab menu.
  // It allows us to reuse the page level removal confirmation dialog,
  // rather than relying on a per-row confirmation component.
  const cancelTargetAssignment = useCallback(
    (selectable: EnterpriseTeamSeatAssignment) => {
      return () => {
        if (!selectable.id) {
          return setTargetAssignment(null)
        }

        setTargetAssignment(EnterpriseTeamAssignment.toRemotePayload(selectable))
        beginCancel()
      }
    },
    [beginCancel],
  )

  const [targetAssignment, setTargetAssignment] = useState<EnterpriseTeamAssignable | null>(null)

  const selected = useMemo(
    () =>
      EnterpriseTeamAssignment.selectedAssignmentsInjector(
        selectedItems,
        seatAssignments,
        (assignment, injected) => {
          const item = EnterpriseTeamAssignment.toRemotePayload(assignment)
          injected.push(item)
          return injected
        },
        [] as EnterpriseTeamAssignables,
      ),
    [selectedItems, seatAssignments],
  )
  const selectedIds = useMemo(() => {
    if (targetAssignment) {
      return `enterprise_team_ids[]=${encodeURIComponent(targetAssignment.id)}`
    }

    return selected.map(item => `enterprise_team_ids[]=${encodeURIComponent(item.id)}`).join('&')
  }, [selected, targetAssignment])

  const sort = useCallback(
    (sortName: SortName) => {
      props.setSortDetails(sortName)
    },
    [props],
  )

  const onPageChange: Parameters<typeof Pagination>['0']['onPageChange'] = (e, page) => {
    e.preventDefault()
    props.paginate(page)
  }

  return (
    <div role="region" aria-label="Seats management table">
      <div
        className="mt-3 d-flex flex-items-center px-3 table-list-header table-list-header-next py-1"
        role="region"
        aria-label="Seat management table header"
      >
        <div className="select-all-dropdown flex-auto">
          <div className="d-flex flex-items-center">
            <div className="pr-2">
              <Checkbox
                onChange={checkAll}
                indeterminate={isIndeterminate}
                disabled={!anySelectable}
                checked={allChecked}
                data-testid="selectAll"
                sx={{height: 13, width: 13}}
                aria-label="Select all members"
              />
            </div>
            <div className="text-bold">{props.headerText({selectedCount: checkCount, totalCount: count})}</div>
          </div>
        </div>
        {anyChecked && withDelete ? (
          <Button
            size="small"
            leadingVisual={TrashIcon}
            variant="danger"
            onClick={beginCancel}
            data-testid="bulk-remove-button"
          >
            Cancel team access
          </Button>
        ) : (
          <AssignablesSort sort={sort} sortDetails={props.sortDetails} sortOptions={SORT_OPTIONS} />
        )}
      </div>
      <div id="table-body">
        <Box
          as="ul"
          aria-label="Teams list"
          className="table-list-bordered"
          data-testid="cs-seat-assignments"
          sx={{position: 'relative'}}
        >
          {query && seatAssignments.length === 0 && <NoSearchResultsBlankslate />}
          {seatAssignments.map((selectable, i) => {
            return (
              <SelectableTableRow
                key={i}
                seatAssignment={selectable}
                checked={isChecked(selectable)}
                handleCheck={handleCheck(selectable)}
                handleCancel={cancelTargetAssignment(selectable)}
                handleRestore={createAssignment}
                owner={owner}
                withRowActions={props.withRowActions ?? true}
                disabled={denySelectionFilters.some(filter => filter(selectable))}
                statusInfo={props.statusInfo}
              />
            )
          })}
        </Box>
      </div>
      {filtered_count > PAGE_SIZE && (
        <Pagination
          showPages={filtered_count > PAGE_SIZE}
          pageCount={Math.ceil(filtered_count / PAGE_SIZE)}
          currentPage={props.currentPage}
          onPageChange={onPageChange}
          data-testid="pagination"
        />
      )}
      <RemoveTeamAssignmentsDialog
        isOpen={pendingConfirmation}
        onCancel={rejectConfirmation}
        onConfirm={() => confirmCancellation(selectedIds)}
        error={cancellationError}
        toCancel={!targetAssignment ? selected : targetAssignment}
      />
    </div>
  )
}
