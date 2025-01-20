import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Button, Octicon} from '@primer/react'

import {FilterOperator, FilterOperators, type MutableFilterBlock} from '../types'
import {getAllFilterOperators} from '../utils'

const operatorButtonSx = {
  alignContent: 'start',
  bg: 'canvas.default',
  fontSize: 0,
  boxShadow: 'unset',
  textAlign: 'left',
  display: 'inline-flex',
  minWidth: '0',
  width: ['auto', 'auto', '100%'],
  minHeight: [32, 32, 28],
  '> span': {
    gap: '2px',
    gridTemplateColumns: 'min-content minmax(0,1fr) min-content',
    flex: 1,
    'span[data-component="text"]': {
      display: 'block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
}
interface OperatorSelectProps {
  filterBlock: MutableFilterBlock
  index: number
  setFilterOperator: (operator: FilterOperator) => void
}

export const OperatorSelect = ({filterBlock, index, setFilterOperator}: OperatorSelectProps) => {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <Button
          size="small"
          disabled={!filterBlock.provider}
          id={`afd-row-${index}-operator`}
          aria-label={`Operator ${index + 1}`}
          sx={operatorButtonSx}
          trailingVisual={() => <Octicon icon={TriangleDownIcon} sx={{color: 'fg.muted'}} />}
        >
          {filterBlock.operator ? FilterOperators[filterBlock.operator] : FilterOperators[FilterOperator.Is]}
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="auto">
        <ActionList selectionVariant="single">
          {getAllFilterOperators(filterBlock.provider).map(operator => (
            <ActionList.Item
              key={`advanced-filter-item-${filterBlock.id}-operator-${operator}`}
              onSelect={() => setFilterOperator(operator)}
              selected={operator === filterBlock.operator}
            >
              {FilterOperators[operator]}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
