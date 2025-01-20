import type {HighchartsReactRefObject} from 'highcharts-react-official'
import {ActionMenu, ActionList, Box, IconButton} from '@primer/react'
import {Dialog, DataTable, Table, type DialogProps, useSlots} from '@primer/react/drafts'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useCallback, useEffect, useMemo, useRef, useState, cloneElement} from 'react'
import {LeadingVisual} from './ChartCard/LeadingVisual'
import merge from 'lodash-es/merge'
import {Title} from './ChartCard/Title'
import {Description} from './ChartCard/Description'
import {TrailingVisual} from './ChartCard/TrailingVisual'
import {Chart} from './ChartCard/Chart'
import type {Size} from './shared'
import ChartCardContext, {type ContextProps} from './ChartCard/context'

function DialogBodyWithoutPadding({children}: React.PropsWithChildren<DialogProps>) {
  return <Dialog.Body sx={{padding: 0}}>{children}</Dialog.Body>
}

export interface ChartCardProps {
  /**
   * The chart’s height (which affects its width and the card’s size). The following presets are supported: `"xl"`, `"large"`, `"medium"`, `"small"`, or `"sparkline"`. Arbitrary numbers are also supported (for custom chart heights, in pixels). When set to `"sparkline"`, the chart’s title, description, menu, padding, and border are hidden.
   * @default "medium"
   */
  size?: Size

  /**
   * Whether the card has a border. When set to `false`, the card has no border.
   * @default true
   */
  border?: boolean

  /**
   * Whether the card has padding. When set to `"none"`, the card has no padding.
   * @default "normal"
   */
  padding?: 'normal' | 'none' | 'spacious'

  /**
   * Whether the chart menu is visible. When set to `false`, the chart menu is hidden.
   * @default true
   */
  visibleControls?: boolean

  /**
   * Additional classes to apply to the card.
   */
  className?: string

  /**
   * The card’s content. Supported subcomponents:
   * - `ChartCard.LeadingVisual`,
   * - `ChartCard.Title`,
   * - `ChartCard.Description`,
   * - `ChartCard.TrailingVisual`, and
   * - `ChartCard.Chart`.
   */
  children: React.ReactNode
}

function Card({
  size = 'medium',
  border: _border,
  padding = 'normal',
  visibleControls: _visibleControls,
  className,
  children,
}: ChartCardProps & {children: React.ReactNode}) {
  const visibleControls = _visibleControls ?? size !== 'sparkline'
  const border = _border ?? size !== 'sparkline'

  const [slots] = useSlots(children, {
    leadingVisual: LeadingVisual,
    title: Title,
    description: Description,
    trailingVisual: TrailingVisual,
    chart: Chart,
  })
  const [title, setTitle] = useState<ContextProps['title']>('')
  const [description, setDescription] = useState<ContextProps['description']>('')
  const chartRef = useRef<HighchartsReactRefObject>(null)
  const contextProviderValue = useMemo(
    () => ({title, setTitle, description, setDescription, size, chartRef}),
    [title, setTitle, description, setDescription, size, chartRef],
  )

  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const [dialogOpen, setDialogOpen] = useState<boolean | undefined>()

  /** Show the dialog containing the data table */
  const openDialog = useCallback(() => setDialogOpen(true), [])

  /** Hide the dialog containing the data table. */
  const closeDialog = useCallback(() => setDialogOpen(false), [])

  /** After dialog is hidden, return focus to the menu button. */
  useEffect(() => {
    if (dialogOpen === false) {
      menuButtonRef.current?.focus()
    }
  }, [dialogOpen])

  /** Convert a Highcharts-provided multi-dimensional array of chart labels and data into a UniqueData structure used by DataTable. */
  const getDialogData = useCallback(() => {
    if (!chartRef.current?.chart) return []
    const rows = chartRef.current.chart.getDataRows()
    const [labelsRow, ...dataRows] = rows as [string[], ...Array<Array<string | number>>]
    return dataRows.map((dataRow, id: number) =>
      dataRow.reduce(
        (acc: {[key: string]: string | number}, value: string | number, index: number) => ({
          ...acc,
          id,
          [labelsRow[index] as string]: value,
        }),
        {},
      ),
    ) as Array<{[key: string]: string | number; id: number}>
  }, [chartRef])

  /** Convert a Highcharts-provided multi-dimensional array of chart labels and data into a Column structure used by DataTable. */
  const getDialogColumns = useCallback(() => {
    if (!chartRef.current?.chart) return []
    const rows = chartRef.current?.chart?.getDataRows()
    const labelsRow = rows[0] as string[]
    return labelsRow.map((label, id: number) => ({
      header: label,
      field: label,
      rowHeader: id === 0,
    }))
  }, [chartRef])

  /** Generates a data URL of CSV for local download in the browser. This is the default action for a click on the 'Download CSV' button. */
  const downloadCSV = useCallback(() => chartRef.current?.chart?.downloadCSV(), [chartRef])

  /** Downloads chart as PNG. This is the default action for a click on the 'Download PNG' button. */
  const downloadPNG = useCallback(() => {
    const stringifiedOptions = JSON.stringify(chartRef.current?.chart?.userOptions, (_key: string, value) => {
      if (typeof value === 'string') {
        // Replace CSS variables with their computed values
        return value.replace(/var\(--([^,)]+)[,)]+/g, (_match, p1) => {
          // Get the computed value of the CSS variable
          return getComputedStyle(chartRef.current?.container.current ?? document.body)
            .getPropertyValue(`--${p1}`)
            .trim()
        })
      }
      // Pass other values through unchanged. Nested object values are handled recursively.
      return value
    })
    chartRef.current?.chart?.exportChartLocal({type: 'image/png'}, JSON.parse(stringifiedOptions))
  }, [chartRef])

  let chart = null
  if (slots.chart) {
    const overrideOptionsNotRecommended = merge({}, slots.chart.props.overrideOptionsNotRecommended || {}, {
      accessibility: {
        screenReaderSection: {
          onViewDataTableClick: openDialog,
        },
      },
    })
    chart = cloneElement(slots.chart, {overrideOptionsNotRecommended})
  }

  return (
    <ChartCardContext.Provider value={contextProviderValue}>
      <Box
        className={className}
        sx={{
          ...(border ? {borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default', borderRadius: 2} : {}),
          p: padding === 'none' ? 0 : `var(--stack-padding-${padding})`,
        }}
        {...testIdProps('chart-card')}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignContent: 'flex-start',
            mb: size !== 'sparkline' ? 3 : 0,
          }}
        >
          <Box sx={{display: 'flex'}}>
            <Box sx={{mr: slots.leadingVisual ? 2 : 0, alignContent: 'center'}}>{slots.leadingVisual}</Box>
            <div>
              {slots.title}
              {slots.description}
            </div>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', alignSelf: 'flex-start'}}>
            <Box sx={{mr: slots.leadingVisual ? 2 : 0}}>{slots.trailingVisual}</Box>
            {visibleControls && (
              <ActionMenu anchorRef={menuButtonRef}>
                <ActionMenu.Anchor>
                  <IconButton aria-label="Chart options" icon={KebabHorizontalIcon} variant="invisible" size="small" />
                </ActionMenu.Anchor>
                <ActionMenu.Overlay width="auto">
                  <ActionList>
                    <ActionList.Item onSelect={openDialog}>View as table</ActionList.Item>
                    <ActionList.Item onSelect={downloadCSV}>Download CSV</ActionList.Item>
                    <ActionList.Item onSelect={downloadPNG}>Download PNG</ActionList.Item>
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            )}
          </Box>
        </Box>
        {chart}
      </Box>
      {dialogOpen && (
        <Dialog
          title={title}
          onClose={closeDialog}
          footerButtons={[{buttonType: 'default', content: 'Download CSV', onClick: downloadCSV}]}
          renderBody={DialogBodyWithoutPadding}
        >
          <Table.Container
            sx={{
              '.Table': {'--table-border-radius': 0},
              '.TableHeader:first-child,.TableCell:first-child': {borderLeft: 0},
              '.TableHeader:last-child,.TableCell:last-child': {borderRight: 0},
            }}
          >
            <DataTable data={getDialogData()} columns={getDialogColumns()} />
          </Table.Container>
        </Dialog>
      )}
    </ChartCardContext.Provider>
  )
}
Card.displayName = 'ChartCard'

/**
 * ChartCard is a layout component that positions a chart and its title, description, and menu, plus an optional leading and/or trailing visual.
 */
export const ChartCard = Object.assign(Card, {
  LeadingVisual,
  Title,
  Description,
  TrailingVisual,
  Chart,
  Context: ChartCardContext,
})
