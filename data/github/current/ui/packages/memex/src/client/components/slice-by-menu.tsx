import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {XIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import {memo, useCallback, useMemo} from 'react'
import {flushSync} from 'react-dom'

import {SliceByApplied, type SliceByAppliedUIType, SliceByRemoved} from '../api/stats/contracts'
import {canServerSliceByColumnType} from '../features/server-capabilities'
import {useSliceBy} from '../features/slicing/hooks/use-slice-by'
import {isSliceableField} from '../features/slicing/slice-utils'
import {sortColumnsDeterministically} from '../helpers/util'
import {usePostStats} from '../hooks/common/use-post-stats'
import {useEnabledFeatures} from '../hooks/use-enabled-features'
import {useMemexProjectViewRootHeight} from '../hooks/use-memex-app-root-height'
import {useViewOptionsStatsUiKey} from '../hooks/use-view-options-stats-ui-key'
import {useViewType} from '../hooks/use-view-type'
import {useViews} from '../hooks/use-views'
import {useAllColumns} from '../state-providers/columns/use-all-columns'
import {getColumnIcon} from './column-detail-helpers'

type MenuProps = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
  id?: string
  ui?: SliceByAppliedUIType
}

export const SliceByMenu = memo<MenuProps>(function SliceByMenu({id, open, setOpen, anchorRef, ui}) {
  const statsUiKey = useViewOptionsStatsUiKey()

  const {clientHeight} = useMemexProjectViewRootHeight({
    onResize: () => {
      if (open) {
        flushSync(() => {
          setOpen(false)
        })
        setOpen(true)
      }
    },
  })

  return (
    <ActionMenu open={open} anchorRef={anchorRef} onOpenChange={noop}>
      <ActionMenu.Overlay
        sx={{maxHeight: clientHeight, overflow: 'auto'}}
        {...testIdProps('slice-by-menu')}
        role="dialog"
        aria-label="Select a field to slice by"
        onEscape={() => setOpen(false)}
        onClickOutside={() => setOpen(false)}
      >
        <Options id={id} key={String(open)} setOpen={setOpen} ui={ui ?? statsUiKey} />
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})

const Options = memo(function Options({setOpen, id, ui}: Pick<MenuProps, 'setOpen' | 'id' | 'ui'>) {
  const {currentView} = useViews()
  const {viewType} = useViewType()
  const {allColumns} = useAllColumns()
  const {sliceField, setSliceField, clearSliceField} = useSliceBy()
  const {postStats} = usePostStats()
  const {memex_table_without_limits} = useEnabledFeatures()

  const columnItems = useMemo(() => {
    const baseColumnItems = allColumns
      .slice()
      .filter(column => isSliceableField(column.dataType))
      .sort(sortColumnsDeterministically)
      .map(column => {
        const onSelection = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
          // the column is currently visible, so the stat is that we are hiding it.
          if (!currentView) return
          const isSliceField = sliceField === column
          if (isSliceField) {
            clearSliceField(currentView.number)
          } else {
            setSliceField(currentView.number, column)
          }

          setOpen(false)
          e.stopPropagation()

          postStats({
            name: isSliceField ? SliceByRemoved : SliceByApplied,
            memexProjectColumnId: column.id,
            ui,
            context: JSON.stringify({layout: viewType}),
          })
        }

        const Icon = getColumnIcon(column.dataType)
        return (
          <ActionList.Item
            key={column.id}
            onSelect={onSelection}
            selected={sliceField === column}
            disabled={memex_table_without_limits && !canServerSliceByColumnType(column.dataType)}
            {...testIdProps(`slice-${column.name}`)}
          >
            <ActionList.LeadingVisual>
              <Icon />
            </ActionList.LeadingVisual>
            {column.name}
          </ActionList.Item>
        )
      })

    return baseColumnItems
  }, [
    allColumns,
    sliceField,
    memex_table_without_limits,
    currentView,
    setOpen,
    postStats,
    ui,
    viewType,
    clearSliceField,
    setSliceField,
  ])

  const handleNoSlicing = useCallback(() => {
    const hadSlicing = !!sliceField
    if (currentView) clearSliceField(currentView.number)
    setOpen(false)

    if (hadSlicing) {
      postStats({
        name: SliceByRemoved,
        ui,
        context: JSON.stringify({layout: viewType}),
      })
    }
  }, [clearSliceField, currentView, postStats, setOpen, sliceField, ui, viewType])

  return (
    <ActionList id={id} selectionVariant="single">
      <ActionList.Group key="slice">
        <ActionList.GroupHeading>Slice by</ActionList.GroupHeading>
        {columnItems}
        <ActionList.Item
          selected={!sliceField}
          key={'slice-none'}
          onSelect={handleNoSlicing}
          {...testIdProps('slice-none')}
        >
          <ActionList.LeadingVisual>
            <XIcon />
          </ActionList.LeadingVisual>
          No slicing
        </ActionList.Item>
      </ActionList.Group>
    </ActionList>
  )
})

// We have renamed the feature from "pivot" to "slicer".
// However, we will continue to use the original PivotIcon design until we find out otherwise.
const pivotIconPath = (
  <>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.5 1.5H6.5V5H10C10.4142 5 10.75 5.33579 10.75 5.75C10.75 6.16421 10.4142 6.5 10 6.5H6.5V7.75C6.5 8.16421 6.16421 8.5 5.75 8.5C5.33579 8.5 5 8.16421 5 7.75V6.5H1.5V14.5H5V12.75C5 12.3358 5.33579 12 5.75 12C6.16421 12 6.5 12.3358 6.5 12.75V14.5H14.5V1.5ZM5 1.5V5H1.5V1.5H5ZM0 14.5V5.75V1.5C0 0.671573 0.671573 0 1.5 0H5.75H14.5C15.3284 0 16 0.671573 16 1.5V14.5C16 15.3284 15.3284 16 14.5 16H5.75H1.5C0.671573 16 0 15.3284 0 14.5ZM9.62012 9.58516C10.8677 9.59206 11.8826 8.58286 11.8826 7.33544V6.32279C11.8826 5.90857 12.2184 5.57279 12.6326 5.57279C13.0468 5.57279 13.3826 5.90857 13.3826 6.32279V7.33544C13.3826 9.4147 11.6909 11.0966 9.61182 11.0851L9.3826 11.0839L9.3826 12.9995C9.3826 13.2178 9.12245 13.3312 8.96248 13.1827L6.07989 10.506C5.97337 10.4071 5.97337 10.2385 6.07989 10.1396L8.96248 7.46291C9.12245 7.31438 9.3826 7.42782 9.3826 7.64611V9.58384L9.62012 9.58516Z"
    />
  </>
)

/**
 * Temporary icon for pivot, while we work on getting the official icon into
 * the @primer/octicons package. We can hard-code the dimensions for now, since
 * we only use this icon in one place.
 *
 * Update: We have renamed our feature from "pivot" to "slicer", but it's TBD if the icon will change.
 */
export function SlicerIcon() {
  const width = 16
  const height = 16
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="currentColor"
      className="octicon"
      style={{
        display: 'inline-block',
        userSelect: 'none',
        overflow: 'visible',
      }}
    >
      {pivotIconPath}
    </svg>
  )
}
