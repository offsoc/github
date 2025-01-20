import type {ClipboardTable} from './types'

/**
 * Delimiter used to separate cells in plaintext representation of table (ie, comma for CSV, tab for TSV). We use TSV
 * format because it is less likely a cell will contain a tab than a comma, reducing the need to quote cells.
 */
const PLAINTEXT_CELL_DELIMITER = '\t'

/** Delimiter used to separate rows in plaintext representation of table. */
const PLAINTEXT_ROW_DELIMITER = '\n'

/** Escape / quote value if necessary. Escapes further quotes inside the value by doubling them (CSV standard). */
const escapeCellText = (value = '') =>
  value.includes(PLAINTEXT_CELL_DELIMITER) ? `"${value.replaceAll('"', '""')}"` : value

export const buildPlaintextTableForClipboardContent = (rows: ClipboardTable, header?: Array<string>) => {
  const init = header ? [header.map(name => escapeCellText(name)).join(PLAINTEXT_CELL_DELIMITER)] : []

  return [
    ...init,
    ...rows.map(row =>
      row.map(cellClipboardContent => escapeCellText(cellClipboardContent?.text)).join(PLAINTEXT_CELL_DELIMITER),
    ),
  ].join(PLAINTEXT_ROW_DELIMITER)
}
