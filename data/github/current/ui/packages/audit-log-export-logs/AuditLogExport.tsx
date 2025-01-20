export interface AuditLogExport {
  actor_name: string
  actor_url: string
  format_type: string
  export_type: string
  query_phrase: string
  created_at: string
  completed: boolean
  expired: boolean
  pending: boolean
  total_chunks: number
  export_id: string
}
