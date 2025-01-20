import {testIdProps} from '@github-ui/test-id-props'
import {CalendarIcon, type Icon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box} from '@primer/react'
import {useCallback, useId, useMemo} from 'react'

import type {MemexChartXAxisDataSource} from '../../../../api/charts/contracts/api'
import {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import {getColumnIcon} from '../../../../components/column-detail-helpers'
import {not_typesafe_nonNullAssertion} from '../../../../helpers/non-null-assertion'
import {useEnabledFeatures} from '../../../../hooks/use-enabled-features'
import {isHistoricalChart} from '../../../../state-providers/charts/chart-helpers'
import {useChartActions} from '../../../../state-providers/charts/use-chart-actions'
import type {ChartState} from '../../../../state-providers/charts/use-charts'
import {useSetNextChartParams} from '../../../../state-providers/charts/use-set-next-chart-params'
import {useAllColumns} from '../../../../state-providers/columns/use-all-columns'
import {useFindColumnByName} from '../../../../state-providers/columns/use-find-column-by-name'
import {InsightsResources} from '../../../../strings'
import {useInsightsEnabledFeatures} from '../../hooks/use-insights-features'
import {selectorDropdownButtonStyles, selectorDropdownOverlayStyles, SelectorLabel} from './shared'
import {Validation} from './validation'

type XAxisOption = {
  label: string
  icon: Icon
  type: MemexChartXAxisDataSource['column']
  category: 'historical' | 'field'
}

const fieldTypesForXAxis = new Set<MemexColumnDataType>([
  MemexColumnDataType.Iteration,
  MemexColumnDataType.SingleSelect,
  MemexColumnDataType.Milestone,
  MemexColumnDataType.Repository,
  MemexColumnDataType.Labels,
  MemexColumnDataType.Assignees,
  MemexColumnDataType.IssueType,
  MemexColumnDataType.ParentIssue,
])

const fieldTypesForHistoricalGroupBy = new Set<MemexColumnDataType>([
  MemexColumnDataType.Iteration,
  MemexColumnDataType.SingleSelect,
  MemexColumnDataType.Repository,
  MemexColumnDataType.Labels,
])

const milestoneAssigneesFieldTypes = new Set<MemexColumnDataType>([
  MemexColumnDataType.Milestone,
  MemexColumnDataType.Assignees,
])

const getXAxisFieldLabel = (selectedOption: XAxisOption | undefined, invalidField: boolean) =>
  selectedOption?.label ?? (invalidField ? InsightsResources.invalidFieldLabel : 'None')

const errorBorderStyles = {borderColor: 'danger.emphasis'}

const getDropdownSx = (invalid: boolean) => ({
  ...selectorDropdownButtonStyles,
  ...(invalid ? errorBorderStyles : {}),
})

export function XAxisSelector({chart}: {chart: ChartState}) {
  const {allColumns} = useAllColumns()
  const {findColumnByName} = useFindColumnByName()
  const {updateLocalChartConfiguration} = useChartActions()
  const {setNextChartParams} = useSetNextChartParams(chart)
  const statusColumn = not_typesafe_nonNullAssertion(findColumnByName('Status'))
  const {memex_historical_charts_on_assignees_milestones} = useEnabledFeatures()

  const handleXAxisChange = useCallback(
    (xAxis: XAxisOption) => {
      const nextConfig = {
        xAxis: {
          ...chart.localVersion.configuration.xAxis,
          dataSource: {
            column: xAxis.type,
          },
          groupBy: xAxis.type === 'time' ? {column: statusColumn.databaseId} : undefined,
        },
        yAxis:
          xAxis.type === 'time'
            ? {
                aggregate: {
                  operation: 'count' as const,
                },
              }
            : chart.localVersion.configuration.yAxis,
      }
      updateLocalChartConfiguration(chart.number, nextConfig)
      setNextChartParams(nextConfig)
    },
    [
      statusColumn.databaseId,
      chart.localVersion.configuration.xAxis,
      chart.localVersion.configuration.yAxis,
      chart.number,
      setNextChartParams,
      updateLocalChartConfiguration,
    ],
  )

  const handleXAxisGroupByChange = useCallback(
    (xAxisType: XAxisOption['type'] | null) => {
      // Strings are not valid for a group by, but this should not happen
      // since it is filtered out in the options list
      if (xAxisType === 'time') return
      const nextConfig = {
        xAxis: {
          ...chart.localVersion.configuration.xAxis,
          groupBy: xAxisType == null ? undefined : {column: xAxisType},
        },
      }
      updateLocalChartConfiguration(chart.number, nextConfig)

      setNextChartParams(nextConfig)
    },
    [chart.localVersion.configuration.xAxis, chart.number, setNextChartParams, updateLocalChartConfiguration],
  )

  const xAxisOptions: Array<XAxisOption> = useMemo(
    () =>
      allColumns
        .filter(column => fieldTypesForXAxis.has(column.dataType))
        .map<XAxisOption>(column => ({
          label: column.name,
          icon: getColumnIcon(column.dataType),
          type: column.databaseId,
          category: 'field',
        }))
        .concat({label: 'Time', type: 'time', icon: CalendarIcon, category: 'historical'})
        .sort((a, b) => a.label.localeCompare(b.label)),
    [allColumns],
  )

  const historicalGroupByOptions: Array<XAxisOption> = useMemo(() => {
    // Add Assignees & Milestone only if FF is enabled
    const fieldTypesForGroupBy = new Set([
      ...fieldTypesForHistoricalGroupBy,
      ...(memex_historical_charts_on_assignees_milestones ? milestoneAssigneesFieldTypes : []),
    ])

    return allColumns
      .filter(column => fieldTypesForGroupBy.has(column.dataType))
      .map<XAxisOption>(column => ({
        label: column.name,
        icon: getColumnIcon(column.dataType),
        type: column.databaseId,
        category: 'field',
      }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [allColumns, memex_historical_charts_on_assignees_milestones])

  const selectedXAxis = xAxisOptions.find(
    option => option.type === chart.localVersion.configuration.xAxis.dataSource.column,
  )
  // If xAxis.dataSource.column exists, but matches no xAxisOptions,
  // show an error prompting the user to select a valid option.
  // This can happen if a column is deleted from the project.
  const xAxisIsInvalidField = !selectedXAxis && !!chart.localVersion.configuration.xAxis.dataSource.column
  const xAxisLabel = getXAxisFieldLabel(selectedXAxis, xAxisIsInvalidField)

  const historicalXAxisOptions = useMemo(
    () => xAxisOptions.filter(option => option.category === 'historical'),
    [xAxisOptions],
  )
  const fieldXAxisOptions = useMemo(() => xAxisOptions.filter(option => option.category === 'field'), [xAxisOptions])

  const xAxisGroupByOptions = useMemo(() => {
    // for historical charts, we support grouping by types in fieldTypesForHistoricalGroupBy
    if (isHistoricalChart(chart)) {
      return historicalGroupByOptions
    }
    // Shouldn't be able to select time as a group by, nor should we be able to
    // select the field that's already the X axis
    return xAxisOptions.filter(option => !(option.type === 'time' || option.type === selectedXAxis?.type))
  }, [chart, historicalGroupByOptions, selectedXAxis?.type, xAxisOptions])

  // X-axis group by must be set to "status" when the X-axis is "time"
  const selectedXAxisGroupBy = xAxisGroupByOptions.find(
    option => option.type === chart.localVersion.configuration.xAxis.groupBy?.column,
  )
  // If xAxis.groupBy.column exists, but matches no xAxisGroupByOptions,
  // show an error prompting the user to select a valid option.
  // This can happen if a column is deleted from the project.
  const groupByIsInvalidField = !selectedXAxisGroupBy && !!chart.localVersion.configuration.xAxis.groupBy?.column
  const xAxisGroupByButtonLabel = getXAxisFieldLabel(selectedXAxisGroupBy, groupByIsInvalidField)

  const invalidConfigMessage = (
    <Validation validationStatus="error">{InsightsResources.invalidFieldErrorMessage}</Validation>
  )

  const {isInsightsEnabled} = useInsightsEnabledFeatures()
  const isXAxisTime = chart.localVersion.configuration.xAxis.dataSource.column === 'time'

  const labelId = useId()
  const buttonId = useId()
  const groupByLabelId = useId()
  const groupByButtonId = useId()

  return (
    <>
      <Box sx={{mb: 4}}>
        <SelectorLabel id={labelId}>X-axis</SelectorLabel>
        <ActionMenu>
          <ActionMenu.Button
            leadingVisual={selectedXAxis?.icon}
            sx={getDropdownSx(xAxisIsInvalidField)}
            id={buttonId}
            aria-labelledby={`${labelId} ${buttonId}`}
          >
            {xAxisLabel}
          </ActionMenu.Button>
          <ActionMenu.Overlay sx={selectorDropdownOverlayStyles}>
            <ActionList selectionVariant="single" {...testIdProps('chart-x-axis-list')}>
              {isInsightsEnabled && (
                <ActionList.Group>
                  <ActionList.GroupHeading>Historical</ActionList.GroupHeading>
                  {historicalXAxisOptions.map((field, index) => {
                    return (
                      <ActionList.Item
                        key={index}
                        selected={selectedXAxis?.type === field.type}
                        onSelect={() => handleXAxisChange(field)}
                      >
                        <ActionList.LeadingVisual>
                          <field.icon />
                        </ActionList.LeadingVisual>
                        {field.label}
                      </ActionList.Item>
                    )
                  })}
                </ActionList.Group>
              )}
              <ActionList.Group>
                <ActionList.GroupHeading>{isInsightsEnabled ? 'Fields' : ''}</ActionList.GroupHeading>
                {fieldXAxisOptions.map((field, index) => (
                  <ActionList.Item
                    key={index}
                    selected={selectedXAxis?.type === field.type}
                    onSelect={() => handleXAxisChange(field)}
                  >
                    <ActionList.LeadingVisual>
                      <field.icon />
                    </ActionList.LeadingVisual>
                    {field.label}
                  </ActionList.Item>
                ))}
              </ActionList.Group>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
        {xAxisIsInvalidField ? invalidConfigMessage : null}
      </Box>
      {/* Disable group by for time charts when lean historical charts are enabled */}
      {isXAxisTime ? null : (
        <Box sx={{mb: 4}}>
          <SelectorLabel id={groupByLabelId}>Group by (optional)</SelectorLabel>
          <ActionMenu>
            <ActionMenu.Button
              id={groupByButtonId}
              aria-labelledby={`${groupByLabelId} ${groupByButtonId}`}
              leadingVisual={selectedXAxisGroupBy?.icon}
              sx={getDropdownSx(groupByIsInvalidField)}
            >
              {xAxisGroupByButtonLabel}
            </ActionMenu.Button>
            <ActionMenu.Overlay sx={selectorDropdownOverlayStyles}>
              <ActionList selectionVariant="single" {...testIdProps('chart-x-axis-group-by-list')}>
                <ActionList.Item
                  selected={chart.localVersion.configuration.xAxis.groupBy === undefined}
                  onSelect={() => handleXAxisGroupByChange(null)}
                >
                  None
                </ActionList.Item>
                {xAxisGroupByOptions.map((field, index) => {
                  return (
                    <ActionList.Item
                      key={index}
                      selected={chart.localVersion.configuration.xAxis.groupBy?.column === field.type}
                      onSelect={() => handleXAxisGroupByChange(field.type)}
                    >
                      <ActionList.LeadingVisual>
                        <field.icon />
                      </ActionList.LeadingVisual>
                      {field.label}
                    </ActionList.Item>
                  )
                })}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
          {groupByIsInvalidField ? invalidConfigMessage : null}
        </Box>
      )}
    </>
  )
}
