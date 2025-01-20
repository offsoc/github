import {testIdProps} from '@github-ui/test-id-props'
import type {HeaderGroup} from 'react-table'

import {AddColumnId} from '../column-ids'
import type {TableDataType} from '../table-data-type'
import {columnHeaderTestId} from '../test-identifiers'
import {HeaderGridCell} from './header-grid-cell'
import {HeaderGridCellLayout} from './header-grid-cell-layout'

export const DummyHeaderCell = (props: {header: HeaderGroup<TableDataType>; height: number}) => {
  const {dragProps, ...headerProps} = props.header.getHeaderProps({
    style: {minWidth: props.header.width, height: props.height},
  })

  if (props.header.id === AddColumnId) {
    // workaround to ensure add column is rendered like our other header cells
    return (
      <HeaderGridCell
        tabIndex={-1}
        {...headerProps}
        key={headerProps.key}
        {...dragProps.listeners}
        {...testIdProps(columnHeaderTestId(props.header.id))}
        ref={dragProps.setNodeRef}
      >
        <HeaderGridCellLayout sx={{padding: 0, flexGrow: 1}}>{props.header.render('Header')}</HeaderGridCellLayout>
      </HeaderGridCell>
    )
  }

  return <div {...headerProps} key={headerProps.key} role="cell" {...dragProps.listeners} ref={dragProps.setNodeRef} />
}
