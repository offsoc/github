import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, ActionMenu, Box} from '@primer/react'
import {useCallback, useId, useMemo} from 'react'

import type {MemexChartOperation, MemexChartYAxisAggregate} from '../../../../api/charts/contracts/api'
import {MemexColumnDataType} from '../../../../api/columns/contracts/memex-column'
import {getColumnIcon} from '../../../../components/column-detail-helpers'
import type {ColumnModel} from '../../../../models/column-model'
import {useChartActions} from '../../../../state-providers/charts/use-chart-actions'
import type {ChartState} from '../../../../state-providers/charts/use-charts'
import {useSetNextChartParams} from '../../../../state-providers/charts/use-set-next-chart-params'
import {useAllColumns} from '../../../../state-providers/columns/use-all-columns'
import {InsightsResources} from '../../../../strings'
import {selectorDropdownButtonStyles, selectorDropdownOverlayStyles, SelectorLabel} from './shared'
import {Validation} from './validation'

type YAxisAggregateOption = {label: string; type: MemexChartYAxisAggregate['operation']}

const doesAggregateOperationNeedField = (operation: MemexChartYAxisAggregate['operation']) => operation !== 'count'
const fieldTypesForAggregate = new Set<MemexColumnDataType>([MemexColumnDataType.Number])

export const getYAxisAggregateLabel = (operation: MemexChartOperation, fieldName: string) => {
  return `${InsightsResources.operationLabel[operation]} ${fieldName}`
}

const aggregateOperationsMap: {[operation in MemexChartOperation]: {label: string; type: operation}} = {
  count: {label: getYAxisAggregateLabel('count', 'items'), type: 'count'},
  sum: {label: getYAxisAggregateLabel('sum', 'a field'), type: 'sum'},
  avg: {label: getYAxisAggregateLabel('avg', 'a field'), type: 'avg'},
  min: {label: getYAxisAggregateLabel('min', 'a field'), type: 'min'},
  max: {label: getYAxisAggregateLabel('max', 'a field'), type: 'max'},
}

const aggregateOperationOptions = Object.values(aggregateOperationsMap)

const getAggregationFieldLabel = (selectedOption: {field: ColumnModel} | undefined, invalidField: boolean) =>
  selectedOption?.field.name ?? (invalidField ? InsightsResources.invalidFieldLabel : 'None')

export function YAxisSelector({chart}: {chart: ChartState}) {
  const {setNextChartParams} = useSetNextChartParams(chart)
  const {allColumns} = useAllColumns()
  const {updateLocalChartConfiguration} = useChartActions()

  const aggregateFieldOptions = useMemo(() => {
    return allColumns
      .filter(column => fieldTypesForAggregate.has(column.dataType))
      .map(column => ({
        label: column.name,
        icon: getColumnIcon(column.dataType),
        field: column,
      }))
  }, [allColumns])

  const handleAggregateOperationChange = useCallback(
    (aggregateOperation: YAxisAggregateOption) => {
      const nextYAxisAggregate = {
        operation: aggregateOperation.type,
        columns:
          aggregateOperation.type === 'count'
            ? undefined
            : aggregateFieldOptions[0]?.field.databaseId
              ? [aggregateFieldOptions[0].field.databaseId]
              : undefined,
      }
      const nextConfig = {
        yAxis: {
          ...chart.localVersion.configuration.yAxis,
          aggregate: nextYAxisAggregate,
        },
      }
      updateLocalChartConfiguration(chart.number, nextConfig)

      setNextChartParams(nextConfig)
    },
    [
      aggregateFieldOptions,
      chart.localVersion.configuration.yAxis,
      chart.number,
      setNextChartParams,
      updateLocalChartConfiguration,
    ],
  )

  const handleAggregateFieldChange = useCallback(
    (columns: Array<number>) => {
      const nextConfig = {
        yAxis: {
          ...chart.localVersion.configuration.yAxis,
          aggregate: {
            ...chart.localVersion.configuration.yAxis.aggregate,
            columns,
          },
        },
      }
      updateLocalChartConfiguration(chart.number, nextConfig)
      setNextChartParams(nextConfig)
    },
    [chart.localVersion.configuration.yAxis, chart.number, setNextChartParams, updateLocalChartConfiguration],
  )

  const aggregateColumns = chart.localVersion.configuration.yAxis.aggregate.columns || []
  const selectedAggregateFieldOption = aggregateFieldOptions.find(option =>
    aggregateColumns.includes(option.field.databaseId),
  )
  // If yAxis.aggregate.columns exists, but matches no aggregateFieldOptions,
  // show an error prompting the user to select a valid option.
  // This can happen if a column is deleted from the project.
  const aggregateFieldIsInvalid = !selectedAggregateFieldOption && aggregateColumns.length > 0
  const errorBorderStyles = aggregateFieldIsInvalid ? {borderColor: 'danger.emphasis'} : {}
  const invalidConfigMessage = (
    <Validation validationStatus="error">{InsightsResources.invalidFieldErrorMessage}</Validation>
  )
  const aggregationFieldLabel = getAggregationFieldLabel(selectedAggregateFieldOption, aggregateFieldIsInvalid)

  const selectedAggregateOperation = aggregateOperationsMap[chart.localVersion.configuration.yAxis.aggregate.operation]

  const labelId = useId()
  const buttonId = useId()
  const fieldLabelId = useId()
  const fieldButtonId = useId()

  return (
    <Box sx={{mb: 4}}>
      <SelectorLabel id={labelId}>Y-axis</SelectorLabel>
      <ActionMenu>
        <ActionMenu.Button id={buttonId} aria-labelledby={`${labelId} ${buttonId}`} sx={selectorDropdownButtonStyles}>
          {selectedAggregateOperation?.label ?? 'None'}
        </ActionMenu.Button>
        <ActionMenu.Overlay sx={selectorDropdownOverlayStyles}>
          <ActionList selectionVariant="single" {...testIdProps('chart-y-axis-list')}>
            {aggregateOperationOptions.map((aggregate, index) => {
              return (
                <ActionList.Item
                  key={index}
                  selected={selectedAggregateOperation?.type === aggregate.type}
                  onSelect={() => handleAggregateOperationChange(aggregate)}
                  disabled={doesAggregateOperationNeedField(aggregate.type) && aggregateFieldOptions.length === 0}
                >
                  {aggregate.label}
                </ActionList.Item>
              )
            })}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      {selectedAggregateOperation && doesAggregateOperationNeedField(selectedAggregateOperation.type) ? (
        <>
          <ActionMenu>
            <SelectorLabel id={fieldLabelId} sx={{mt: 4}}>
              Y-axis field
            </SelectorLabel>
            <ActionMenu.Button
              id={fieldButtonId}
              aria-labelledby={`${fieldLabelId} ${fieldButtonId}`}
              sx={{
                ...selectorDropdownButtonStyles,
                mt: 3,
                ...errorBorderStyles,
              }}
              leadingVisual={selectedAggregateFieldOption?.icon}
              disabled={aggregateFieldOptions.length === 0}
            >
              {aggregationFieldLabel}
            </ActionMenu.Button>
            <ActionMenu.Overlay sx={selectorDropdownOverlayStyles}>
              <ActionList selectionVariant="single" {...testIdProps('chart-y-axis-field-list')}>
                {aggregateFieldOptions.map((option, index) => {
                  return (
                    <ActionList.Item
                      key={index}
                      selected={selectedAggregateFieldOption?.field.databaseId === option.field.databaseId}
                      onSelect={() => handleAggregateFieldChange([option.field.databaseId])}
                    >
                      <ActionList.LeadingVisual>
                        <option.icon />
                      </ActionList.LeadingVisual>
                      {option.field.name}
                    </ActionList.Item>
                  )
                })}
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
          {aggregateFieldIsInvalid ? invalidConfigMessage : null}
        </>
      ) : null}
    </Box>
  )
}
