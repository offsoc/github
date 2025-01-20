import {Box, Spinner, useFocusZone} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {FocusKeys} from '@primer/behaviors'
import {useCreateFetcher} from '../../hooks/use-fetchers'
import {useSeatManagementContext} from '../hooks/use-seat-management-context'
import {usePaginatedSearchQuery} from '../../hooks/use-search-query'
import {NewAssignmentsEstimatedCost} from './NewAssignmentsEstimatedCost'
import {FilterableSearch} from './FilterableSearch'
import {SelectableTable} from './SelectableTable'
import type {EnterpriseTeamSeatAssignment} from '../../types'
import {usePreventBodyScroll} from '../hooks/use-prevent-body-scoll'
import {SelectionStateProvider} from './SelectionStateProvider'
import {makeSelectedKey} from '../helpers/make-selected-key'
import {EnterpriseTeamAssignment} from '../helpers/enterprise-team-assignment'
import {useSelectionStateContext} from '../hooks/use-selection-state-context'
import {useMemo, type Ref, useCallback, useEffect, useState} from 'react'
import {useCreateSeatAssignment} from '../hooks/use-create-seat-assignment'
import type {
  CopilotStandaloneSeatManagementPayload,
  EnterpriseTeamAssignable,
  EnterpriseTeamAssignables,
} from '../types'
import {pluralize} from '../../helpers/text'
import {usePaginateScroll} from '../hooks/use-paginate-scroll'
import {standaloneSeatManagementEndpoint} from '../helpers/api-endpoints'
import {StatusText} from './Ui'
import {CopilotFlash} from '../../components/CopilotFlash'

function ScrollPaginator({loading, listEndRef}: {loading: boolean; listEndRef: Ref<HTMLDivElement>}) {
  return (
    <>
      {loading && (
        <Box sx={{display: 'flex', justifyContent: 'center', p: 4}}>
          <Spinner />
        </Box>
      )}
      <div ref={listEndRef} />
    </>
  )
}

function SelectableTableHeader(props: Parameters<React.ComponentProps<typeof SelectableTable>['headerText']>[0]) {
  if (!props.selectedCount) {
    return <span>0 selected</span>
  }

  return <span data-testid="bulk-selected">{pluralize(props.selectedCount, 'team', 's')} selected</span>
}

type DialogBodyProps = React.PropsWithChildren<{
  queryState: ReturnType<typeof usePaginatedSearchQuery>
}>

const denySelectionFilters = [EnterpriseTeamAssignment.isStable]

function DialogBody(props: DialogBodyProps) {
  const selectionContextVal = useSelectionStateContext()
  const {selectionState} = selectionContextVal
  const {queryState} = props

  return (
    <Box as="section" sx={{padding: 3, maxHeight: 360, overflowY: 'auto'}}>
      <FilterableSearch search={queryState.handleSearch} placeholder="Filter enterprise teams" />
      <SelectableTable
        query={queryState.query}
        paginate={queryState.paginate}
        currentPage={queryState.currentPage}
        sortDetails={queryState.sortDetails}
        setSortDetails={queryState.updateSortDetails}
        items={selectionState.selectables}
        headerText={SelectableTableHeader}
        denySelectionFilters={denySelectionFilters}
        withDelete={false}
        withRowActions={false}
        statusInfo={StatusText}
      />
      {props.children}
    </Box>
  )
}

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (assignments: EnterpriseTeamAssignable[]) => void
}

export function AssignmentsDialog(props: React.PropsWithChildren<Props>) {
  const {isOpen, onClose} = props

  const contextValue = useSelectionStateContext()
  const {selectionState, stableRef, updateStableRef} = contextValue
  const {selectedItems, selectables} = selectionState

  const [uniqueSelected, setUniqueSelected] = useState(0)

  // Store a ref to the underlying selectables as they become selected.
  // We need this to handle the following case:
  // * User has selected some number of teams
  // * User and then searches for another team
  // * We must preserve the original selection during the search, to redisplay them
  //   if / when the search is cleared.
  useEffect(() => {
    for (const item of selectedItems) {
      if (stableRef[item]) {
        continue
      }
      const id = Number(item.split('_').pop())
      const assignment = selectables.find(seatAssignment => seatAssignment.assignable.id === id)

      // If the assignment doesnt exist but we have a record of it, remove it
      if (item in stableRef && !assignment) {
        stableRef[item] = null
      }

      if (assignment) {
        stableRef[item] = assignment
      }
    }

    for (const key in stableRef) {
      if (!selectedItems.includes(key)) {
        stableRef[key] = null
      }
    }
    updateStableRef(stableRef)
    setUniqueSelected(
      Object.values(stableRef).reduce((unique: Set<number>, assignment: EnterpriseTeamSeatAssignment) => {
        if (!assignment) {
          return unique
        }
        return new Set([...unique].concat(assignment.assignable.member_ids))
      }, new Set<number>()).size,
    )
  }, [selectedItems, selectables, stableRef, updateStableRef])

  const onConfirm = () => {
    const toCreate = EnterpriseTeamAssignment.selectedAssignmentsInjector(
      selectedItems,
      Object.values(stableRef),
      (assignment, injected) => {
        if (!assignment) {
          return injected
        }

        const payload = EnterpriseTeamAssignment.toRemotePayload(assignment)
        injected.push(payload)
        return injected
      },
      [] as EnterpriseTeamAssignables,
    )

    props.onConfirm(toCreate)
  }

  usePreventBodyScroll({isActive: isOpen})

  if (!isOpen) {
    return null
  }

  return (
    <Dialog
      onClose={onClose}
      sx={{width: '768px'}}
      data-testid="add-members-dialog"
      title="Add enterprise teams to enable access to Copilot Business"
      renderBody={() => <>{props.children}</>}
      renderFooter={({footerButtons}) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const {containerRef: footerRef} = useFocusZone({
          bindKeys: FocusKeys.ArrowHorizontal | FocusKeys.Tab,
          focusInStrategy: 'closest',
        })

        return (
          <Dialog.Footer
            ref={footerRef as React.RefObject<HTMLDivElement>}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3,
              flexWrap: 'nowrap',
            }}
          >
            <NewAssignmentsEstimatedCost seatCount={uniqueSelected} seatCost={19} />
            {footerButtons && (
              <Box sx={{display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0, justifySelf: 'flex-end'}}>
                <Dialog.Buttons buttons={footerButtons} />
              </Box>
            )}
          </Dialog.Footer>
        )
      }}
      footerButtons={[
        {content: 'Cancel', onClick: onClose},
        {
          content: 'Add teams',
          onClick: onConfirm,
          buttonType: 'primary',
        },
      ]}
    />
  )
}

export function AddSeatAssignmentsDialog(props: Omit<Props, 'onConfirm'>) {
  const {payload, update} = useSeatManagementContext()
  const {business} = payload

  const queryState = usePaginatedSearchQuery({initialSort: 'name_asc'})

  const useCopilotStandaloneFetcher = useCreateFetcher(standaloneSeatManagementEndpoint, {slug: business.slug})
  const {data, loading} = useCopilotStandaloneFetcher<{teams: EnterpriseTeamSeatAssignment[]; total: number}>({
    resource: `members/search?${queryState.makeQueryString()}`,
  })
  const [pagedData, updatePagedData] = useState(data?.teams ?? [])

  const {listEndRef, listHeadRef, doReset} = usePaginateScroll({
    shouldLoadMore: !queryState.query,
    currentPage: queryState.currentPage,
    onPaginate: queryState.paginate,
    loading,
    totalItems: data?.total ?? 0,
    shouldReset: queryState.queryHasChanged(),
  })

  useEffect(() => {
    if (doReset.current) {
      updatePagedData(data?.teams ?? [])
      doReset.current = false
    } else {
      updatePagedData(currentData => {
        const newData = data?.teams ?? []

        for (const assignment of currentData) {
          if (newData.some(newTeamAssignment => newTeamAssignment.assignable.id === assignment.assignable.id)) {
            continue
          }

          newData.push(assignment)
        }

        return newData
      })
    }
  }, [doReset, data])

  const {createAssignment, error} = useCreateSeatAssignment<CopilotStandaloneSeatManagementPayload>({
    owner: business.slug,
    onComplete: updated => {
      props.onClose()
      update(updated)
    },
  })

  const isUnassigned = useCallback(
    (maybeAssignment: EnterpriseTeamSeatAssignment) => maybeAssignment.status !== 'stable',
    [],
  )
  const tableFilters = useMemo(() => [EnterpriseTeamAssignment.isSelectable, isUnassigned], [isUnassigned])

  return (
    <SelectionStateProvider<EnterpriseTeamSeatAssignment>
      selectionState={{
        selectables: pagedData,
        total: data?.total ?? 0,
        key: makeSelectedKey,
        filters: tableFilters,
      }}
    >
      <AssignmentsDialog {...props} onConfirm={createAssignment}>
        <Box ref={listHeadRef} sx={{minHeight: 200}}>
          {error && <CopilotFlash variant="danger">{error}</CopilotFlash>}
          <DialogBody queryState={queryState}>
            <ScrollPaginator listEndRef={listEndRef} loading={loading} />
          </DialogBody>
        </Box>
      </AssignmentsDialog>
    </SelectionStateProvider>
  )
}
