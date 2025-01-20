import {useState} from 'react'
import {Box, Heading, Link, Text, RelativeTime} from '@primer/react'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {ExportButton, ExportType} from './ExportButton'
import type {ExportSubmitResponse, RadioRange} from './ExportButton'
import {ExportDownloadButton} from './ExportDownloadButton'
import type {AuditLogExport} from './AuditLogExport'

export interface AuditLogExportLogsProps {
  exports: AuditLogExport[]
  webExportUrl: string
  gitExportUrl: string
  chunksPerDownload: number
  downloadWebExportUrl: string
  downloadGitExportUrl: string
  showGitExportButton: boolean
}

export function AuditLogExportLogs({
  exports,
  webExportUrl,
  gitExportUrl,
  chunksPerDownload,
  downloadWebExportUrl,
  downloadGitExportUrl,
  showGitExportButton,
}: AuditLogExportLogsProps) {
  const [getExports, setExports] = useState((): AuditLogExport[] => exports)

  const handleSubmit = (response: ExportSubmitResponse) => {
    if (response.errors.length < 1) {
      if (Array.isArray(response.exports) && response.exports.length > 0) {
        setExports(previous => {
          return [...response.exports, ...previous]
        })
      }
    }
  }

  const gitButtonProps = {
    exportUrl: gitExportUrl,
    exportType: ExportType.Git,
    radioRange: ['1', '3', '7'] as RadioRange,
    onSubmit: handleSubmit,
  }
  const webButtonProps = {
    exportUrl: webExportUrl,
    exportType: ExportType.Web,
    radioRange: ['7', '30', '180'] as RadioRange,
    onSubmit: handleSubmit,
  }

  return (
    <div>
      <Box
        className="export-buttons"
        sx={{
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'border.default',
          borderRadius: 2,
          marginBottom: 4,
        }}
      >
        {showGitExportButton && (
          <Box
            sx={{
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
              borderBottomColor: 'border.default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 2,
              paddingRight: 3,
              paddingLeft: 3,
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Heading as="h3" sx={{fontSize: 2, fontWeight: 'bold'}}>
                Export Git activity
              </Heading>
              <span>Download Git activity limited to the last 7 days</span>
            </Box>
            <div>
              <ExportButton {...gitButtonProps} />
            </div>
          </Box>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 2,
            paddingRight: 3,
            paddingLeft: 3,
          }}
        >
          <Box sx={{display: 'flex', flexDirection: 'column'}}>
            <Heading as="h3" sx={{fontSize: 2, fontWeight: 'bold'}}>
              Export application events
            </Heading>
            <span>Download application event data up to the last 180 days in CSV or JSON</span>
          </Box>
          <div>
            <ExportButton {...webButtonProps} />
          </div>
        </Box>
      </Box>
      <Heading
        as="h3"
        sx={{
          fontSize: 3,
          borderBottomWidth: 1,
          borderBottomStyle: 'solid',
          borderColor: 'border.subtle',
          marginBottom: 4,
        }}
      >
        Export history
        <p className="f6 lh-condensed">Last 30 Days</p>
      </Heading>
      <Box
        className="export-history-container"
        sx={{
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'border.default',
          borderRadius: 2,
          marginBottom: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            height: 48,
            fontSize: 2,
            backgroundColor: 'canvas.subtle',
            borderBottomWidth: 1,
            borderBottomStyle: 'solid',
            borderBottomColor: 'border.default',
          }}
        >
          <Text sx={{paddingLeft: 3}}>{getExports.length} items</Text>
        </Box>
        {exportList(getExports, chunksPerDownload, downloadWebExportUrl, downloadGitExportUrl)}
      </Box>
    </div>
  )
}

function exportList(
  list: AuditLogExport[],
  chunksPerDownload: number,
  downloadWebExportUrl: string,
  downloadGitExportUrl: string,
) {
  if (list.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 2,
          paddingBottom: 2,
        }}
      >
        <Heading as="h4" sx={{fontSize: 3}} data-testid="missing-exports-message">
          We couldn&apos;t find any exports.
        </Heading>
      </Box>
    )
  } else {
    return list.map((item, idx) => {
      const props = {item, chunksPerDownload, downloadWebExportUrl, downloadGitExportUrl}
      return (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
          data-testid={`export-${idx}`}
          key={idx}
        >
          <Link href={`/${item.actor_name}`}>
            <GitHubAvatar
              sx={{marginLeft: 3, marginRight: 3}}
              src={item.actor_url}
              alt={`${item.actor_name} profile`}
            />
          </Link>
          <Box
            sx={{
              borderTopWidth: idx === 0 ? 0 : 1,
              borderTopStyle: 'solid',
              borderTopColor: 'border.default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: 2,
              paddingBottom: 2,
              paddingRight: 2,
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
              <Heading as="h4" sx={{fontSize: 2, fontWeight: 'normal'}}>
                <strong>{item.actor_name}</strong> — {item.export_type}
              </Heading>
              <span>
                Requested <RelativeTime datetime={item.created_at} /> · {item.query_phrase}
              </span>
            </Box>
            <ExportDownloadButton {...props} />
          </Box>
        </Box>
      )
    })
  }
}
