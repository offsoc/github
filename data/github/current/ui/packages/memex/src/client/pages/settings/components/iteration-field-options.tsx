import {testIdProps} from '@github-ui/test-id-props'
import {Box, Button, Flash, Text} from '@primer/react'
import {Fragment, useEffect, useMemo, useRef} from 'react'

import type {IterationConfiguration} from '../../../api/columns/contracts/iteration'
import {ColumnSettingsSavedMessage} from '../../../components/column-settings-saved-message'
import {RequestStateIcon} from '../../../components/common/state-style-decorators'
import {not_typesafe_nonNullAssertion} from '../../../helpers/non-null-assertion'
import {usePrefixedId} from '../../../hooks/common/use-prefixed-id'
import {useIterationFieldOptions} from '../../../hooks/use-iteration-field-options'
import type {ColumnModel} from '../../../models/column-model'
import {Resources, SettingsResources} from '../../../strings'
import {AddBreakButton} from './iteration/add-break-button'
import {IterationBreakRow} from './iteration/iteration-break-row'
import {IterationRow} from './iteration/iteration-row'
import {IterationsHeader} from './iteration/iterations-header'
import {NoIterationsPlaceholder} from './no-iterations-placeholder'

type IterationFieldOptionsProps = {
  column: ColumnModel
  /**
   * Name of field, to use when generating new iterations
   */
  fieldName: string
  /**
   * The server-side configuration state.
   */
  serverConfiguration: IterationConfiguration
  /**
   * The callback to invoke with changes to the configuration for this field
   */
  onUpdate: (changes: Partial<IterationConfiguration>) => Promise<void>
}

export function IterationFieldOptions({column, fieldName, serverConfiguration, onUpdate}: IterationFieldOptionsProps) {
  const {
    // data
    allRowData,
    // checks
    areColumnValuesLoaded,
    hasUnsavedChanges,
    isActiveTab,
    // selected tab
    selectedTab,
    setSelectedTab,
    // handlers
    handleRemoveIteration,
    handleCreateIteration,
    handleChangeIteration,
    handleAddBreak,
    handleChangeBreak,
    handleReset,
    handleSaveChanges,
    countPushedActiveIterations,
    // configurations
    localConfiguration,
    minimumStartDate,
    defaultDuration,
    requestStatus,
  } = useIterationFieldOptions({
    column,
    fieldName,
    serverConfiguration,
    onUpdate,
  })

  const newIterationRowRef = useRef<HTMLDivElement | null>(null)
  const iterationsLength = localConfiguration.iterations.length
  const lastIterationsLength = useRef(iterationsLength)
  const completedIterationsLength = localConfiguration.completedIterations.length
  const lastCompletedIterationsLength = useRef(completedIterationsLength)

  useEffect(() => {
    if (!newIterationRowRef.current) return
    // Iterations containers did not expand
    if (
      iterationsLength <= lastIterationsLength.current &&
      completedIterationsLength <= lastCompletedIterationsLength.current
    )
      return
    newIterationRowRef.current.scrollIntoView({behavior: 'smooth'})
  }, [iterationsLength, completedIterationsLength])

  useEffect(() => {
    lastIterationsLength.current = iterationsLength
    lastCompletedIterationsLength.current = completedIterationsLength
  })

  const rows = useMemo(
    () =>
      allRowData
        .filter(({originalIsCompleted}) => (selectedTab === 'completed' ? originalIsCompleted : !originalIsCompleted))
        .map(
          (
            {
              localIteration,
              localPreviousIteration,
              originalIteration,
              originalIsCompleted,
              originalPreviousIteration,
              breakExistsBefore,
            },
            index,
          ) => {
            return (
              <Fragment key={localIteration.id}>
                {breakExistsBefore ? (
                  <IterationBreakRow
                    onChange={interval =>
                      handleChangeBreak(not_typesafe_nonNullAssertion(localPreviousIteration), localIteration, interval)
                    }
                    localNextIteration={localIteration}
                    localPreviousIteration={not_typesafe_nonNullAssertion(localPreviousIteration)}
                    originalNextIteration={originalIteration}
                    originalPreviousIteration={originalPreviousIteration}
                  />
                ) : null}
                <IterationRow
                  iteration={localIteration}
                  originalIsCompleted={originalIsCompleted}
                  onRemove={() => handleRemoveIteration(localIteration)}
                  onChange={handleChangeIteration}
                  previousIteration={localPreviousIteration}
                  originalIteration={originalIteration}
                >
                  {breakExistsBefore ? null : (
                    <AddBreakButton onClick={() => handleAddBreak(localIteration)} removeTopPadding={index === 0} />
                  )}
                </IterationRow>
              </Fragment>
            )
          },
        ),
    [allRowData, selectedTab, handleAddBreak, handleChangeIteration, handleRemoveIteration, handleChangeBreak],
  )

  const tabpanelId = usePrefixedId('iteration-field-options')

  return (
    <>
      <Box
        sx={{
          width: '100%',
          borderRadius: '6px',
          borderColor: 'border.default',
          borderStyle: 'solid',
          borderWidth: '1px',
          overflow: 'hidden',
          position: 'relative',
          mt: 4,
        }}
      >
        <IterationsHeader
          configuration={localConfiguration}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          addButtonProps={{minimumStartDate, defaultDuration, onCreate: handleCreateIteration}}
          disabled={hasUnsavedChanges}
          tabpanelId={tabpanelId}
        />
        <div role="tabpanel" id={tabpanelId}>
          {rows.length > 0 ? (
            <Box
              as="ol"
              sx={{p: 0}}
              aria-label={selectedTab === 'completed' ? 'Completed iterations' : 'Active iterations'}
            >
              {rows}
            </Box>
          ) : (
            <NoIterationsPlaceholder isActiveTab={isActiveTab} />
          )}
        </div>
        {selectedTab === 'completed' && countPushedActiveIterations > 0 && (
          <Flash sx={{border: 'none', borderRadius: 0}} {...testIdProps('active-changes-notice')}>
            {SettingsResources.willPushActiveIterations(countPushedActiveIterations)}
          </Flash>
        )}
      </Box>

      <div ref={newIterationRowRef} />

      <Box
        sx={{
          gap: 2,
          my: 3,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Button
          variant="primary"
          disabled={!hasUnsavedChanges || requestStatus === 'loading' || !areColumnValuesLoaded}
          onClick={() => handleSaveChanges()}
          {...testIdProps('iteration-field-settings-save')}
        >
          {Resources.saveChanges}
        </Button>
        <Button
          disabled={!hasUnsavedChanges || requestStatus === 'loading'}
          onClick={() => handleReset()}
          {...testIdProps('iteration-field-settings-reset')}
        >
          {Resources.reset}
        </Button>

        <Box sx={{pl: 1}}>
          <RequestStateIcon status={requestStatus} />
          {requestStatus === 'succeeded' ? (
            <ColumnSettingsSavedMessage />
          ) : requestStatus === 'failed' ? (
            <Text sx={{ml: 2}}>{Resources.genericErrorMessage}</Text>
          ) : null}
        </Box>
      </Box>
    </>
  )
}
