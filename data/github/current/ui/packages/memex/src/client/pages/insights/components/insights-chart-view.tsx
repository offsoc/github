import {testIdProps} from '@github-ui/test-id-props'
import {PencilIcon} from '@primer/octicons-react'
import {Box, Button, Heading, Text, themeGet} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {memo, useCallback, useRef} from 'react'
import {useParams} from 'react-router-dom'

import {ErrorBoundary} from '../../../components/error-boundaries/error-boundary'
import {useLoadRequiredFieldsForChartConfiguration} from '../../../hooks/use-load-required-fields'
import {FILTER_QUERY_PARAM} from '../../../platform/url'
import {useSearchParams} from '../../../router'
import {getDirtyChartState, isDefaultChart, isHistoricalChart} from '../../../state-providers/charts/chart-helpers'
import {useChartActions} from '../../../state-providers/charts/use-chart-actions'
import {type ChartState, useCharts} from '../../../state-providers/charts/use-charts'
import {useInsightsConfigurationPane} from '../hooks/use-insights-configuration-pane'
import {useInsightsFilters} from '../hooks/use-insights-filters'
import {useInsightsTime} from '../hooks/use-insights-time'
import {BAR_CHART_TAG_NAME} from './chart-web-components/bar-chart'
import {COLUMN_CHART_TAG_NAME} from './chart-web-components/column-chart'
import {insightsQueryWithOpaqueErrorVersionedTagName} from './chart-web-components/insights-query-element'
import {LINE_CHART_TAG_NAME} from './chart-web-components/line-chart'
import {STACKED_AREA_CHART_TAG_NAME} from './chart-web-components/stacked-area-chart'
import {CurrentInsightsChart} from './current-insights-chart'
import {ChartErrorFallback} from './error-messages/chart-error-fallback'
import {InvalidConfigError} from './error-messages/invalid-config-error'
import {MissingChartError} from './error-messages/missing-chart-error'
import {InsightsChartName} from './insights-chart-name'
import {InsightsConfigurationPane} from './insights-configuration-pane/insights-configuration-pane'
import {InsightsFilters} from './insights-filters'
import {useInsightsUpsellDialog} from './insights-upsell-dialog'
import {LeanHistoricalInsightsChart} from './lean-historical-insights-chart'
import {InsightCustomDatePicker} from './period-navigation/insight-custom-date-picker'
import {PeriodNavigation} from './period-navigation/period-navigation'

export const InsightsChartView = memo(function InsightChartView() {
  const params = useParams()

  const {getChartConfigurationByNumber} = useCharts()
  const chart = getChartConfigurationByNumber(params.insightNumber ? Number(params.insightNumber) : 0)

  if (!chart) {
    return <MissingChartError />
  }

  const errorFallback = <ChartErrorFallback />

  return (
    <ErrorBoundary key={chart.number} fallback={errorFallback}>
      <InsightChartContent chart={chart} />
    </ErrorBoundary>
  )
})

const chartContainerStyles: BetterSystemStyleObject = {
  minWidth: '100%',
  minHeight: '200px',
  aspectRatio: ['4/3', '4/3', '16 / 9'],
  maxWidth: '100%',
  [`& ${insightsQueryWithOpaqueErrorVersionedTagName}`]: {
    width: '100%',
    display: 'block',
    height: '100%',
  },
  [`& ${BAR_CHART_TAG_NAME},
    & ${LINE_CHART_TAG_NAME},
    & ${COLUMN_CHART_TAG_NAME},
    & ${STACKED_AREA_CHART_TAG_NAME}`]: {
    width: '100%',
    display: 'block',
    height: '100%',
    border: '1px solid',
    borderColor: 'border.default',
    borderRadius: 2,
    p: 5,
  },
  // Charts have an inline style we're overriding here
  '& .redaction_msg': {
    ml: `unset !important`,
  },
}

const chartBufferStyles: BetterSystemStyleObject = {
  width: '100%',
  height: '100%',
}

const InsightChartContent = memo<{chart: ChartState}>(function InsightChartContent({chart}) {
  const {updateChartConfiguration} = useChartActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    filteredItems,
    filterValue,
    handleFilterValueChange,
    onClearButtonClick,
    setValueFromSuggestion,
    resetFilter,
    inputRef,
  } = useInsightsFilters(chart)
  const {endDate, period, startDate} = useInsightsTime(chart)
  const {openPane, isOpen} = useInsightsConfigurationPane()

  const {isLoading, isValid} = useLoadRequiredFieldsForChartConfiguration(chart.localVersion.configuration)

  const handleSaveChanges = useCallback(async () => {
    if (isDefaultChart(chart)) return
    await updateChartConfiguration.perform({
      chartNumber: chart.number,
      chart: {
        configuration: {
          ...chart.localVersion.configuration,
          filter: filterValue,
        },
      },
    })
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete(FILTER_QUERY_PARAM)
    setSearchParams(nextParams, {replace: true})
  }, [chart, filterValue, searchParams, setSearchParams, updateChartConfiguration])

  const dirtyState = getDirtyChartState(chart)

  const chartIsDefault = isDefaultChart(chart)
  const isUserDefinedChart = !chartIsDefault
  const isHistorical = isHistoricalChart(chart)

  const {InsightsUpsellDialog, showDialog: showUpsellDialog} = useInsightsUpsellDialog()
  const configureButtonRef = useRef<HTMLButtonElement | null>(null)

  return (
    <Box sx={{maxWidth: themeGet('sizes.large'), mx: 'auto', display: 'flex', flexDirection: 'column', gap: '24px'}}>
      <Heading
        {...testIdProps('insights-header')}
        as="h2"
        sx={{
          borderBottomStyle: 'solid',
          borderBottomWidth: '1px',
          borderBottomColor: 'border.muted',
          fontSize: 4,
          fontWeight: 'normal',
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {chartIsDefault ? chart.name : <InsightsChartName chart={chart} />}
        <div>
          <Button
            ref={configureButtonRef}
            leadingVisual={PencilIcon}
            onClick={openPane}
            {...testIdProps('insights-configuration-pane-button-open')}
          >
            Configure
          </Button>
        </div>
      </Heading>
      {chart.description ? (
        <Text sx={{fontSize: 1}} {...testIdProps('insights-description')}>
          {chart.description}{' '}
        </Text>
      ) : null}
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <Box sx={{width: '100%'}}>
          <InsightsFilters
            inputRef={inputRef}
            filteredItems={filteredItems}
            filterValue={filterValue}
            handleFilterValueChange={handleFilterValueChange}
            onClearButtonClick={onClearButtonClick}
            setValueFromSuggestion={setValueFromSuggestion}
            onSaveChanges={isUserDefinedChart && dirtyState.isFilterDirty ? handleSaveChanges : undefined}
            hideSaveButton={!isUserDefinedChart}
            onResetChanges={dirtyState.isFilterDirty ? resetFilter : undefined}
          />
        </Box>
      </Box>
      {!isValid ? (
        <InvalidConfigError />
      ) : (
        <>
          {isHistorical ? (
            <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
              <PeriodNavigation period={period} />
              <InsightCustomDatePicker startDate={startDate} endDate={endDate} />
            </Box>
          ) : null}
          <Box sx={chartContainerStyles}>
            <Box sx={chartBufferStyles}>
              {isHistorical ? (
                <LeanHistoricalInsightsChart
                  configuration={chart.localVersion.configuration}
                  isLoading={isLoading}
                  filteredItems={filteredItems}
                  filterValue={filterValue}
                  startDate={startDate}
                  endDate={endDate}
                />
              ) : (
                <CurrentInsightsChart
                  configuration={chart.localVersion.configuration}
                  isLoading={isLoading}
                  filterValue={filterValue}
                  filteredItems={filteredItems}
                />
              )}
            </Box>
          </Box>
        </>
      )}
      {isOpen && (
        <InsightsConfigurationPane
          chart={chart}
          showUpsellDialog={showUpsellDialog}
          returnFocusRef={configureButtonRef}
        />
      )}
      <InsightsUpsellDialog />
    </Box>
  )
})
