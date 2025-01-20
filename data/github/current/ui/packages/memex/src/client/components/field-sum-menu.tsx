import {noop} from '@github-ui/noop'
import {testIdProps} from '@github-ui/test-id-props'
import {ActionList, ActionMenu} from '@primer/react'
import {memo, useMemo} from 'react'
import {flushSync} from 'react-dom'

import {MemexColumnDataType} from '../api/columns/contracts/memex-column'
import {
  AggregationSettingsItemsCountHidden,
  AggregationSettingsItemsCountShown,
  AggregationSettingsSumApplied,
  AggregationSettingsSumRemoved,
} from '../api/stats/contracts'
import {onSubMenuMultiSelection, sortColumnsDeterministically} from '../helpers/util'
import {usePostStats} from '../hooks/common/use-post-stats'
import {useAggregationSettings} from '../hooks/use-aggregation-settings'
import {useMemexProjectViewRootHeight} from '../hooks/use-memex-app-root-height'
import {useViewOptionsStatsUiKey} from '../hooks/use-view-options-stats-ui-key'
import {useViews} from '../hooks/use-views'
import {useAllColumns} from '../state-providers/columns/use-all-columns'

type MenuProps = {
  id?: string
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: React.RefObject<HTMLElement>
}

/**
 * The control used in the board view to specify the fields that are used
 * to display the sum of the values in the field.
 */
export const FieldSumMenu = memo<MenuProps>(function FieldSumMenu({id, open, setOpen, anchorRef}) {
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
        {...testIdProps('field-sum-menu')}
        onEscape={() => setOpen(false)}
        onClickOutside={() => setOpen(false)}
      >
        <MenuOptions id={id} key={String(open)} />
      </ActionMenu.Overlay>
    </ActionMenu>
  )
})

const MenuOptions = memo(function MenuOptions({id}: Pick<MenuProps, 'id'>) {
  const {currentView} = useViews()
  const {allColumns} = useAllColumns()
  const numberFields = useMemo(
    () => allColumns.filter(f => f.dataType === MemexColumnDataType.Number).sort(sortColumnsDeterministically),
    [allColumns],
  )
  const {hideItemsCount, sum, toggleItemsCount, addFieldAggregation, removeFieldAggregation} = useAggregationSettings()
  const {postStats} = usePostStats()
  const viewType = currentView?.localViewStateDeserialized?.viewType
  const statsUiKey = useViewOptionsStatsUiKey()

  const countOption = useMemo(() => {
    const onSelection = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      // the column is currently visible, so the stat is that we are hiding it.
      if (!currentView) return

      toggleItemsCount(currentView.number)

      const newHideItems = !hideItemsCount
      postStats({
        name: newHideItems ? AggregationSettingsItemsCountHidden : AggregationSettingsItemsCountShown,
        ui: statsUiKey,
        context: viewType,
      })
      e.stopPropagation()
    }

    return (
      <ActionList.Item
        key="items-count"
        selected={!hideItemsCount}
        onSelect={e => {
          onSubMenuMultiSelection(e)
          onSelection(e)
        }}
        {...testIdProps(`sum-of-items`)}
      >
        Count
      </ActionList.Item>
    )
  }, [hideItemsCount, currentView, toggleItemsCount, postStats, statsUiKey, viewType])

  const numberFieldOptions = useMemo(() => {
    return numberFields.map(numberField => {
      const isSelected = sum.some(field => field.id === numberField.id)

      const onSelection = (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
        // the column is currently visible, so the stat is that we are hiding it.
        if (!currentView) return

        if (isSelected) {
          removeFieldAggregation(currentView.number, 'sum', numberField)
        } else {
          addFieldAggregation(currentView.number, 'sum', numberField)
        }

        const newSelected = !isSelected
        postStats({
          name: newSelected ? AggregationSettingsSumApplied : AggregationSettingsSumRemoved,
          ui: statsUiKey,
          memexProjectColumnId: numberField.id,
          context: viewType,
        })
        e.stopPropagation()
      }

      return (
        <ActionList.Item
          key={numberField.id}
          selected={isSelected}
          onSelect={e => {
            onSubMenuMultiSelection(e)
            onSelection(e)
          }}
          {...testIdProps(`sum-of-${numberField.name}`)}
        >
          {numberField.name}
        </ActionList.Item>
      )
    })
  }, [addFieldAggregation, sum, currentView, numberFields, removeFieldAggregation, postStats, statsUiKey, viewType])

  return (
    <ActionList id={id} selectionVariant="multiple">
      <ActionList.Group>
        <ActionList.GroupHeading>Field sum</ActionList.GroupHeading>
        {countOption}
        {numberFieldOptions}
      </ActionList.Group>
    </ActionList>
  )
})
