import type {MigrationStatus} from '../../api/project-migration/contracts'

export const migrationStatusToProgress = {
  pending: 0,
  in_progress_project_details: 3,
  in_progress_status_fields: 6,
  in_progress_default_view: 10,
  in_progress_permissions: 30,
  in_progress_items: 40,
  in_progress_workflows: 90,
  completed: 100,
  completion_acknowledged: 100,
  // display some progress in case it errors
  error: 25,
}

export function getProgressForStatus(status: MigrationStatus) {
  return migrationStatusToProgress[status] || 0
}
