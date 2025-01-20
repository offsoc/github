import type {CardContextMenuUI, CellEditorUI, RowDraggerMenuUI, SidePanelUI} from './common'

export const DraftConvert = 'draft_convert'
type DraftConvertUIType = typeof SidePanelUI | typeof CardContextMenuUI | typeof CellEditorUI | typeof RowDraggerMenuUI

interface StatsDraftConvert {
  name: typeof DraftConvert
  ui: DraftConvertUIType
  memexProjectItemId: number
}

export const DraftConvertDroppedAssignee = 'draft_convert_dropped_assignee'
interface StatsDraftConvertDroppedAssignee {
  name: typeof DraftConvertDroppedAssignee
  context: number
  memexProjectItemId: number
}

export const DraftEdit = 'draft_edit'
interface StatsDraftEdit {
  name: typeof DraftEdit
  memexProjectItemId: number
}

export const DraftOpen = 'draft_open'
interface StatsDraftOpen {
  name: typeof DraftOpen
  memexProjectItemId: number
}

export type DraftStats = StatsDraftConvert | StatsDraftConvertDroppedAssignee | StatsDraftEdit | StatsDraftOpen
