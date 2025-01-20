import type {AuditLogExportLogsProps} from '../AuditLogExportLogs'

export function getAuditLogExportLogsProps(): AuditLogExportLogsProps {
  return {
    exports: [
      {
        actor_name: 'monalisa',
        actor_url: 'fake.github.url',
        export_type: 'web export',
        created_at: 'Fri, 22 Mar 2024 20:46:30.764652000 UTC +00:00',
        query_phrase: 'Query: ""',
        format_type: 'JSON',
        completed: false,
        expired: false,
        pending: true,
        total_chunks: 0,
        export_id: '42',
      },
      {
        actor_name: 'monalisa',
        actor_url: 'fake.github.url',
        export_type: 'git export',
        created_at: 'Fri, 22 Mar 2024 20:46:30.000000000 UTC +00:00',
        query_phrase: 'From January 11, 2024 to January 12, 2024',
        format_type: '',
        completed: false,
        expired: false,
        pending: true,
        total_chunks: 0,
        export_id: '42',
      },
    ],
    webExportUrl: 'https://example.com/web',
    gitExportUrl: 'https://example.com/git',
    chunksPerDownload: 1,
    downloadWebExportUrl: '',
    downloadGitExportUrl: '',
    showGitExportButton: true,
  }
}
