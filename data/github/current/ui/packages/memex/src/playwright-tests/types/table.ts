export const CellMode = {
  DEFAULT: 'DEFAULT',
  FOCUSED: 'FOCUSED',
  EDITING: 'EDITING',
} as const
export type CellMode = ObjectValues<typeof CellMode>
export type CustomColumnType = 'text' | 'number' | 'date' | 'single-select' | 'iteration'

export type MemexProjectColumnId = number | SystemColumnId

type SystemColumnId = {
  Assignees: 'Assignees'
  Labels: 'Labels'
  Milestone: 'Milestone'
  Repository: 'Repository'
  Title: 'Title'
  Status: 'Status'
}
