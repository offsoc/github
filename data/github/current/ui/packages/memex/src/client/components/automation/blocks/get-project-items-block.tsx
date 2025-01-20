import {testIdProps} from '@github-ui/test-id-props'
import {FilterIcon} from '@primer/octicons-react'
import {Box, FormControl} from '@primer/react'
import {useId, useMemo, useRef} from 'react'

import {parseFullTextQuery} from '../../../components/filter-bar/helpers/search-filter'
import {isArchiveWorkflow} from '../../../helpers/workflow-utilities'
import {useWorkflowPermissions} from '../../../hooks/use-workflow-permissions'
import {useMemexItems} from '../../../state-providers/memex-items/use-memex-items'
import {useAutomationGraph} from '../../../state-providers/workflows/use-automation-graph'
import {WorkflowResources} from '../../../strings'
import {
  FilterSuggestionsItemsContext,
  type FilterSuggestionsItemsContextProps,
} from '../../filter-bar/filter-suggestions'
import {TokenizedFilterInput} from '../../filter-bar/tokenized-filter-input'
import {useGetProjectItemsAction} from '../hooks/use-get-project-items-action'
import {useSearchInputState} from '../hooks/use-search-input-state'
import {TimeBoundFilterWarning} from '../time-bound-filter-warning'
import {AutomationBlock} from './automation-block'
import {DisabledFilterInput} from './disabled-filter-input'

type TimeBoundFilter = {
  field: string
  unit: 'hours'
  value: number
}

const TIME_BOUND_FILTERS: {[field: string]: TimeBoundFilter} = {
  'last-updated': {
    field: 'last-updated',
    unit: 'hours',
    value: 12,
  },
  updated: {
    field: 'updated',
    unit: 'hours',
    value: 12,
  },
}

export const GetProjectItemsBlock = () => {
  const {workflow, initialQuery, localQuery, filterCount} = useAutomationGraph()
  const {hasWorkflowWritePermission} = useWorkflowPermissions()
  const {items} = useMemexItems()

  const {onSearchQueryChange} = useGetProjectItemsAction()

  const {setValueFromSuggestion, isDirty, editingDisabled, clearQuery, handleQueryChange, resetChanges} =
    useSearchInputState({
      query: localQuery,
      initialQuery,
      workflow,
      onQueryChange: onSearchQueryChange,
    })

  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const hasTimeBoundFilters = useMemo(() => isArchiveWorkflow(workflow), [workflow])

  const timedFilters = useMemo(() => {
    const filters = {} as {[field: string]: TimeBoundFilter}
    const parsedQuery = parseFullTextQuery(localQuery)

    for (const token of parsedQuery.orderedTokenizedFilters) {
      const timeBoundFilters = TIME_BOUND_FILTERS[token.type]
      if (timeBoundFilters && !filters[token.type]) {
        filters[token.type] = timeBoundFilters
      }
    }
    return Object.values(filters)
  }, [localQuery])

  const contextValue: FilterSuggestionsItemsContextProps = useMemo(() => {
    return {
      items,
    }
  }, [items])

  const filterValidationId = useId()
  const timeBoundFilterNotificationId = useId()
  const showTimeBoundNotification = hasTimeBoundFilters && timedFilters.length > 0

  return (
    <AutomationBlock
      icon={FilterIcon}
      iconBg="accent.subtle"
      iconColor="accent.fg"
      headerDescription={WorkflowResources.autoArchiveItemsLabel}
    >
      <FormControl
        sx={{
          flex: 1,
          alignItems: 'stretch',
        }}
      >
        <FormControl.Label>Filters</FormControl.Label>
        {!editingDisabled ? (
          <FilterSuggestionsItemsContext.Provider value={contextValue}>
            <TokenizedFilterInput
              height="32px"
              containerRef={searchContainerRef}
              value={localQuery}
              onChange={handleQueryChange}
              inputRef={searchRef}
              onClearButtonClick={clearQuery}
              setValueFromSuggestion={setValueFromSuggestion}
              filterCount={filterCount}
              onResetChanges={isDirty ? resetChanges : undefined}
              suggestColumns={false}
              hideSaveButton
              aria-describedby={showTimeBoundNotification ? timeBoundFilterNotificationId : filterValidationId}
            />
          </FilterSuggestionsItemsContext.Provider>
        ) : (
          <DisabledFilterInput
            query={localQuery}
            filterCount={hasWorkflowWritePermission ? filterCount : undefined}
            icon={<FilterIcon />}
          />
        )}
        {isDirty && localQuery.length === 0 && (
          <FormControl.Validation variant="error" id={filterValidationId}>
            {WorkflowResources.emptyFilterDefault}
          </FormControl.Validation>
        )}
      </FormControl>
      {showTimeBoundNotification && (
        <Box sx={{width: '100%'}} id={timeBoundFilterNotificationId} {...testIdProps('time-bound-notification')}>
          {timedFilters.map(({field, value, unit}: TimeBoundFilter) => (
            <TimeBoundFilterWarning key={field} field={field} value={value} unit={unit} />
          ))}
        </Box>
      )}
    </AutomationBlock>
  )
}
