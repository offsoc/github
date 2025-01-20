import {testIdProps} from '@github-ui/test-id-props'
import {PencilIcon, TrashIcon, TriangleDownIcon, VersionsIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, IconButton, useConfirm} from '@primer/react'
import {useCallback, useRef, useState} from 'react'

import {PotentiallyDirty} from '../../../../components/potentially-dirty'
import {ViewerPrivileges} from '../../../../helpers/viewer-privileges'
import {useNavigate, useSearchParams} from '../../../../router'
import {useProjectRouteParams} from '../../../../router/use-project-route-params'
import {PROJECT_INSIGHTS_NUMBER_ROUTE} from '../../../../routes'
import {
  getDirtyChartState,
  getParamsForFullResetToServerState,
  isDefaultChart,
} from '../../../../state-providers/charts/chart-helpers'
import {useChartActions} from '../../../../state-providers/charts/use-chart-actions'
import {type ChartState, useCharts} from '../../../../state-providers/charts/use-charts'
import {Resources} from '../../../../strings'
import {useInsightsChartName} from '../../hooks/use-insights-chart-name'
import {useInsightsConfigurationPane} from '../../hooks/use-insights-configuration-pane'
import {useInsightsUpsellDialog} from '../insights-upsell-dialog'

interface InsightsChartOptionsProps {
  chart: ChartState
}

export const InsightsChartOptions = ({chart}: InsightsChartOptionsProps) => {
  const {isDirty, isConfigurationDirty} = getDirtyChartState(chart)
  const [, setSearchParams] = useSearchParams()
  const projectRouteParams = useProjectRouteParams()
  const [open, setOpen] = useState(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  const {hasWritePermissions} = ViewerPrivileges()
  const {saveChartName} = useInsightsChartName(chart)
  const {showDialog, InsightsUpsellDialog} = useInsightsUpsellDialog()

  const onOpenChange = useCallback(
    (openState: React.SetStateAction<boolean>): void => {
      setOpen(openState)
      if (!openState) {
        saveChartName()
      }
    },
    [saveChartName],
  )

  const {canCreateChart} = useCharts()
  const {
    destroyChartConfiguration,
    createChartConfiguration,
    updateChartConfiguration,
    resetLocalChangesForChartNumber,
  } = useChartActions()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const {getChartLinkTo} = useCharts()

  type onSelectProp = NonNullable<React.ComponentProps<(typeof ActionList)['Item']>['onSelect']>

  const chartIsDefault = isDefaultChart(chart)
  const userDefinedChart = !chartIsDefault

  const handleDeleteChart: onSelectProp = useCallback(
    async e => {
      e.preventDefault()
      e.stopPropagation()
      if (chartIsDefault) return
      if (
        await confirm({
          title: 'Delete chart?',
          content: `Are you sure you want to delete "${chart.name}"?`,
          confirmButtonContent: 'Delete',
          confirmButtonType: 'danger',
        })
      ) {
        await destroyChartConfiguration.perform(chart.number)
        if (destroyChartConfiguration.status.current.status === 'succeeded') {
          navigate(getChartLinkTo(0).url)
        }
      }
    },
    [chart.name, chart.number, chartIsDefault, confirm, destroyChartConfiguration, getChartLinkTo, navigate],
  )

  const handleDuplicateChart: onSelectProp = useCallback(
    async e => {
      e.preventDefault()
      e.stopPropagation()
      const chartNumberToDuplicate = chart.number
      if (canCreateChart()) {
        await createChartConfiguration.perform({
          chart: {
            configuration: chart.localVersion.configuration,
          },
        })
        if (createChartConfiguration.status.current.status === 'succeeded') {
          navigate(
            PROJECT_INSIGHTS_NUMBER_ROUTE.generatePath({
              ...projectRouteParams,
              insightNumber: createChartConfiguration.status.current.data.chart.number,
            }),
          )
        }
        resetLocalChangesForChartNumber(chartNumberToDuplicate)
      } else {
        showDialog()
      }
    },
    [
      canCreateChart,
      chart.localVersion.configuration,
      chart.number,
      createChartConfiguration,
      navigate,
      resetLocalChangesForChartNumber,
      showDialog,
      projectRouteParams,
    ],
  )
  const handleSaveChanges: onSelectProp = useCallback(
    async e => {
      e.preventDefault()
      e.stopPropagation()
      if (chartIsDefault) return
      await updateChartConfiguration.perform({
        chartNumber: chart.number,
        chart: {
          configuration: {
            ...chart.localVersion.configuration,
          },
        },
      })
      setSearchParams(getParamsForFullResetToServerState(new URLSearchParams(window.location.search)))
    },
    [chart.localVersion.configuration, chart.number, chartIsDefault, setSearchParams, updateChartConfiguration],
  )
  const handleDiscardChanges: onSelectProp = useCallback(
    async e => {
      e.preventDefault()
      e.stopPropagation()

      resetLocalChangesForChartNumber(chart.number)
      setSearchParams(getParamsForFullResetToServerState(new URLSearchParams(window.location.search)))
    },
    [chart.number, resetLocalChangesForChartNumber, setSearchParams],
  )

  const {openPane} = useInsightsConfigurationPane()

  return (
    <>
      <PotentiallyDirty
        isDirty={isDirty}
        hideDirtyState={!hasWritePermissions}
        {...(isDirty ? testIdProps('chart-options-dirty') : undefined)}
      >
        <IconButton
          {...testIdProps('chart-options-button')}
          ref={anchorRef}
          aria-haspopup="true"
          aria-expanded={open}
          icon={TriangleDownIcon}
          onClick={useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault()
            setOpen(s => !s)
          }, [])}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: 1,
            px: 0,
            py: 0,
            pt: '2px',
            height: 18,
            width: 18,
            '& svg': {
              verticalAlign: 'top!important',
            },
          }}
          aria-label="Chart options"
        />
      </PotentiallyDirty>
      <ActionMenu open={open} onOpenChange={onOpenChange} anchorRef={anchorRef}>
        <ActionMenu.Overlay sx={{zIndex: 3}} width="medium">
          <ActionList>
            <ActionList.Item onSelect={openPane} {...testIdProps('chart-options-open-configure')}>
              <ActionList.LeadingVisual>
                <PotentiallyDirty isDirty={isConfigurationDirty}>
                  <PencilIcon />
                </PotentiallyDirty>
              </ActionList.LeadingVisual>
              Configure
            </ActionList.Item>
            <ActionList.Item onSelect={handleDuplicateChart}>
              <ActionList.LeadingVisual>
                <VersionsIcon />
              </ActionList.LeadingVisual>
              {isDirty ? 'Save changes to new chart' : 'Duplicate chart'}
            </ActionList.Item>
            {chartIsDefault ? null : (
              <ActionList.Item variant="danger" onSelect={handleDeleteChart}>
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                Delete chart
              </ActionList.Item>
            )}

            {isDirty ? (
              <>
                <ActionList.Divider />
                <ActionList.Group sx={{'& > ul': {display: 'flex'}}}>
                  {hasWritePermissions && userDefinedChart ? (
                    <ActionList.Item
                      onSelect={handleSaveChanges}
                      {...testIdProps('view-options-menu-save-changes-button')}
                      sx={{
                        flex: 'auto',
                        color: 'accent.fg',
                        borderRight: '1px solid',
                        borderColor: 'border.default',
                        borderRadius: 0,
                        my: -2,
                        mx: 0,
                        py: 3,
                        textAlign: 'center',
                        fontWeight: 'normal',
                        '&:hover': {
                          bg: 'canvas.inset',
                        },
                      }}
                    >
                      {Resources.saveChanges}
                    </ActionList.Item>
                  ) : null}
                  <ActionList.Item
                    onSelect={handleDiscardChanges}
                    {...testIdProps('chart-options-menu-reset-changes-button')}
                    sx={{
                      flex: 'auto',
                      color: 'fg.muted',
                      borderRadius: 0,
                      my: -2,
                      mx: 0,
                      py: 3,
                      textAlign: 'center',
                      fontWeight: 'normal',
                      '&:hover': {
                        bg: 'canvas.inset',
                      },
                    }}
                  >
                    {Resources.discardChanges}
                  </ActionList.Item>
                </ActionList.Group>
              </>
            ) : null}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      <InsightsUpsellDialog />
    </>
  )
}
