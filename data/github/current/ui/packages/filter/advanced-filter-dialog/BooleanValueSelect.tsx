import {testIdProps} from '@github-ui/test-id-props'
import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, Octicon} from '@primer/react'
import type {ItemInput} from '@primer/react/lib-esm/deprecated/ActionList/List'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import type {MutableFilterBlock} from '../types'
import {getFilterValue} from '../utils'
import {ValuePlaceholder} from './ValuePlaceholder'

const booleanButtonSx: BetterSystemStyleObject = {
  alignContent: 'start',
  justifyContent: 'space-between',
  bg: 'canvas.default',
  fontSize: 0,
  boxShadow: 'unset',
  textAlign: 'left',
  display: 'inline-flex',
  width: ['auto', 'auto', 'calc(100% - 8px)'],
  minHeight: [32, 32, 28],
  '> span': {
    gap: '2px',
    gridTemplateColumns: 'min-content minmax(0,1fr) min-content',
    flex: 1,
    'span[data-component="text"]': {
      display: 'inline-flex',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}

interface BooleanValueSelectProps {
  filterBlock: MutableFilterBlock
  setFilterValues: (selected: ItemInput | ItemInput[] | boolean | undefined) => void
}

export const BooleanValueSelect = ({filterBlock, setFilterValues}: BooleanValueSelectProps) => {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <Button
          size="small"
          sx={booleanButtonSx}
          trailingVisual={() => <Octicon icon={TriangleDownIcon} sx={{color: 'fg.muted'}} />}
          {...testIdProps('afd-row-value-select-boolean-button')}
        >
          <ValuePlaceholder filterBlock={filterBlock} />
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList selectionVariant="single" {...testIdProps('afd-row-value-select-list')}>
          <ActionList.Item
            onSelect={() => setFilterValues(true)}
            selected={
              getFilterValue(filterBlock.value?.values[0]?.value) === undefined ||
              getFilterValue(filterBlock.value?.values[0]?.value) === 'true'
            }
          >
            True
          </ActionList.Item>
          <ActionList.Item
            onSelect={() => setFilterValues(false)}
            selected={getFilterValue(filterBlock.value?.values[0]?.value) === 'false'}
          >
            False
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
