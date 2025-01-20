/* eslint eslint-comments/no-use: off */
import type {useSortable} from '@github-ui/drag-and-drop'
import type {
  SortByFn,
  UseRowSelectInstanceProps,
  UseRowSelectOptions,
  UseRowSelectRowProps,
  UseRowSelectState,
  UseSortByInstanceProps,
} from 'react-table'

import type {
  UseColumnReorderingColumnOptions,
  UseColumnReorderingTableState,
} from '../../components/react_table/use-column-reordering'
import type {
  UseCustomGroupByColumnOptions,
  UseCustomGroupByColumnProps,
  UseCustomGroupByInstanceProps,
  UseCustomGroupByRowProps,
  UseCustomGroupByTableState,
} from '../../components/react_table/use-custom-group-by'
import type {UseDeselectAllRowsTableState} from '../../components/react_table/use-deselect-all-rows'
import type {UseRowMenuShortcutTableState} from '../../components/react_table/use-row-menu-shortcut'
import type {UseSortedByGroupOrderingState} from '../../components/react_table/use-sorted-by-group-ordering'
import type {
  CellExtraProps,
  EditorCellExtraProps,
  UseTableFocusColumnOptions,
  UseTableFocusColumnProps,
  UseTableFocusTableState,
} from '../../components/react_table/use-table-focus'
import type {ColumnModel} from '../../models/column-model'

// NOTE: See below for details on react-table typings and plugin use.
// https://github.com/DefinitelyTyped/DefinitelyTyped/blob/69d796e01c91cb18c71c32fb44cefe945b9b1a69/types/react-table/Readme.md

declare module 'react-table' {
  export type ColumnInterface<D extends object> = UseResizeColumnsColumnOptions<D>

  export interface ColumnInstance<D extends object>
    extends UseResizeColumnsColumnProps<D>,
      UseSortByColumnProps<D>,
      UseTableFocusColumnProps<D>,
      UseAddColumnHeaderProps<D>,
      UseCustomGroupByColumnProps<D> {}

  export interface TableState<D extends object>
    extends UseTableFocusTableState,
      UseRowMenuShortcutTableState,
      UseDeselectAllRowsTableState,
      UseColumnReorderingTableState<D>,
      UseResizeColumnsState<D>,
      UseColumnOrderState<D>,
      UseSortByState<D>,
      UseSortedByGroupOrderingState<D>,
      UseRowSelectState<D>,
      UseCustomGroupByTableState<D> {}

  export interface TableResizerProps {
    onMouseDown: React.MouseEventHandler<HTMLElement>
  }

  export interface TableOptions<D extends object>
    extends UseResizeColumnsOptions<D>,
      UseSortByOptions<D>,
      UseRowSelectOptions<D> {
    columns: Array<UseTableColumnOptions<D>>
  }

  export interface TableProps {
    onKeyDown: React.KeyboardEventHandler<HTMLElement>
    onBlur: React.FocusEventHandler<HTMLElement>
  }

  export interface TableHeaderProps {
    dragProps: ReturnType<typeof useSortable>
  }

  export interface TableInstance<D extends object>
    extends UseColumnOrderInstanceProps<D>,
      UseSortByInstanceProps<D>,
      UseRowSelectInstanceProps<D>,
      UseCustomGroupByInstanceProps<D> {}

  export interface UseTableColumnOptions<D extends object>
    extends UseTableFocusColumnOptions<D>,
      UseColumnReorderingColumnOptions<D>,
      UseCustomGroupByColumnOptions<D> {
    Placeholder?: React.ReactNode
    Cell: ((props: RendererCellProps<D>) => React.ReactNode) | React.ReactNode
    CellEditor?: ((props: EditorCellProps<D>) => React.ReactNode) | React.ReactNode
    canSort: boolean
    columnModel?: ColumnModel
    sortType?: SortByFn<D>
    /**
     * Whether the column enables `type to edit mode`
     * this is true by default, and only falsy if explicitly
     * set to false.
     */
    typeToEditEnabled?: boolean
  }

  export interface UseTableRowProps<D extends object> extends UseRowSelectRowProps<D>, UseCustomGroupByRowProps<D> {}

  export type Row<D extends object> = UseTableRowProps<D>

  export interface Cell<_D extends Record<string, unknown> = Record<string, unknown>, _V = any> {}

  export interface RendererCellProps<D extends object, V = any> extends CellProps<D, V>, CellExtraProps {}

  export interface TableRowProps {}
  export interface TableCellProps {}

  export interface EditorCellProps<D extends object, V = any> extends CellProps<D, V>, EditorCellExtraProps {}
}
