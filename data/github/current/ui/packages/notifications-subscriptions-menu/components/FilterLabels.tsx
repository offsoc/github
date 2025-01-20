import React from 'react'
import {type FC, useCallback, useState} from 'react'
import {Button, SelectPanel, Tooltip} from '@primer/react'
import {TagIcon, TriangleDownIcon} from '@primer/octicons-react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import FooterActions from './FooterActions'

interface FilterLabelsProps {
  items: ItemInput[]
  labelsText: string
  selectedLabels: ItemInput[]
  onChangeLabels: (selected: ItemInput[]) => void
  applyLabels: () => void
  resetLabels: () => void
  filterAction: () => void
}

function FilterLabels(props: FilterLabelsProps) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const filteredItems = props.items.filter(item => item?.text?.toLowerCase().startsWith(filter.toLowerCase()))

  const applyLabelsMenu = useCallback(() => {
    props.applyLabels()
    setOpen(false)
  }, [props])

  const cancelLabelsMenu = useCallback(() => {
    props.resetLabels()
    setOpen(false)
  }, [props])

  const ButtonFilter = React.memo(FilterLabelsButton)

  return (
    <>
      <SelectPanel
        title="Select labels"
        renderAnchor={anchorProps =>
          props.items.length === 0 ? (
            <Tooltip text="Add labels to this repository to filter on them." direction="s">
              <ButtonFilter anchorProps={anchorProps} itemsLength={props.items.length} labelsText={props.labelsText} />
            </Tooltip>
          ) : (
            <ButtonFilter anchorProps={anchorProps} itemsLength={props.items.length} labelsText={props.labelsText} />
          )
        }
        placeholderText="Filter labels"
        open={open}
        onOpenChange={setOpen}
        items={filteredItems}
        selected={props.selectedLabels}
        onSelectedChange={props.onChangeLabels}
        onFilterChange={setFilter}
        showItemDividers={true}
        overlayProps={{
          width: 'small',
          height: 'medium',
          maxHeight: 'medium',
        }}
        footer={
          <div style={{width: '100%'}}>
            <FooterActions
              onCancel={cancelLabelsMenu}
              onApply={applyLabelsMenu}
              overrideButtonStyles={{padding: 'var(--base-size-8)'}}
            />
          </div>
        }
      />
    </>
  )
}

export default FilterLabels

const FilterLabelsButton: FC<{
  anchorProps: React.HTMLAttributes<HTMLElement>
  itemsLength: number
  labelsText: string
}> = ({anchorProps, itemsLength, labelsText}) => {
  return (
    <Button
      leadingVisual={TagIcon}
      trailingAction={TriangleDownIcon}
      {...anchorProps}
      aria-label="Filter labels"
      aria-describedby="select-labels"
      aria-haspopup="dialog"
      size="small"
      disabled={itemsLength === 0}
    >
      {itemsLength === 0 ? (
        'No labels available'
      ) : (
        <>
          <span className="color-fg-muted">Labels: </span>
          <span id="select-labels">{labelsText}</span>
        </>
      )}
    </Button>
  )
}
