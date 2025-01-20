export function columnHeaderTestId(columnName: string) {
  return `TableColumnHeader{id: ${columnName}}`
}

export function rowTestId(rowIndex: number) {
  return `TableRow{index: ${rowIndex}}`
}

export function cellTestId(rowIndex: number, columnName: string) {
  return `TableCell{row: ${rowIndex}, column: ${columnName}}`
}

export function cellEditorTestId(rowIndex: number, columnName: string) {
  return `TableCellEditor{row: ${rowIndex}, column: ${columnName}}`
}
