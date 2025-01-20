export type MigrationStatus =
  | 'pending'
  | 'in_progress_project_details'
  | 'in_progress_status_fields'
  | 'in_progress_default_view'
  | 'in_progress_permissions'
  | 'in_progress_items'
  | 'in_progress_workflows'
  | 'completed'
  | 'completion_acknowledged'
  | 'error'

type SourceProject = {
  name: string
  closed: boolean
  path: string
  empty: boolean
}

export type ProjectMigration = {
  id: number
  source_project_id: number
  target_memex_project_id: number
  status: MigrationStatus
  requester_id: number
  last_retried_at: string | null
  last_migrated_project_item_id: number | null
  completed_at: string | null
  updated_at: string
  created_at: string
  source_project: SourceProject | undefined
  is_automated: boolean
}

export type RedirectResponse = {
  redirectUrl?: string
}
