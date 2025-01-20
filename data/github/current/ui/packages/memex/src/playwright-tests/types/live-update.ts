export type MigrationStatus =
  | 'pending'
  | 'in_progress_project_details'
  | 'in_progress_status_fields'
  | 'in_progress_default_view'
  | 'in_progress_permissions'
  | 'in_progress_items'
  | 'in_progress_workflows'
  | 'completed'
  | 'error'

export type DetailEvent = {
  data: {
    actor: {id: number}
    payload: {id: number}
    type: string
  }
  waitFor: number
}
