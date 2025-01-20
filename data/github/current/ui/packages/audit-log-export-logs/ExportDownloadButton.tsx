import {useState} from 'react'
import {TriangleDownIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'
import type {AuditLogExport} from './AuditLogExport'

export interface ExportDownloadButtonProps {
  item: AuditLogExport
  chunksPerDownload: number
  downloadWebExportUrl: string
  downloadGitExportUrl: string
}

export function ExportDownloadButton({
  item,
  chunksPerDownload,
  downloadWebExportUrl,
  downloadGitExportUrl,
}: ExportDownloadButtonProps) {
  const [isDownloadMenuOpen, setDownloadMenuOpen] = useState(false)
  if (item.completed) {
    if (item.expired) {
      return <span data-testid="expired-complete">Expired</span>
    } else {
      const message = item.format_type ? `Download ${item.format_type}` : `Download`

      const defaultParams = {length: chunksPerDownload.toString(), export_id: '', token: ''}
      const isWebExport = item.export_type === 'web export'
      if (isWebExport) {
        defaultParams['export_id'] = item.export_id
      } else {
        defaultParams['token'] = item.export_id
      }
      const urlBuilder = downloadUrlBuilder(isWebExport ? downloadWebExportUrl : downloadGitExportUrl, defaultParams)

      // step through the chunks chunksPerDownload at a time
      // save off the starting index of each step
      const steps = []
      const totalChunks = item.total_chunks
      for (let i = 0; i < totalChunks; i += chunksPerDownload) {
        steps.push(i)
      }

      const handleOpenChange = () => {
        if (totalChunks > chunksPerDownload) {
          // there multiple parts to this download, show the menu
          setDownloadMenuOpen(!isDownloadMenuOpen)
        } else {
          // this export only has a single part, download it when the button is clicked
          window.location.assign(urlBuilder({start: '0'}))
        }
      }

      return (
        <ActionMenu open={isDownloadMenuOpen} onOpenChange={handleOpenChange}>
          <ActionMenu.Button
            data-testid="download-button"
            trailingAction={item.total_chunks > chunksPerDownload ? TriangleDownIcon : null}
          >
            {message}
          </ActionMenu.Button>
          <ActionMenu.Overlay>
            <ActionList selectionVariant="single">
              {steps.map((chunkIndex, index) => (
                <ActionList.Item key={index} data-testid={`download-item-${index.toString()}`}>
                  <a className="" role="menuitem" href={urlBuilder({start: chunkIndex.toString()})}>
                    Part {index + 1}
                  </a>
                </ActionList.Item>
              ))}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )
    }
  } else {
    if (item.pending) {
      return <span data-testid="preparing-export">Preparing export</span>
    } else {
      return <span data-testid="expired-pending">Expired</span>
    }
  }
}

// Given a baseUrl this returns a function that can be used to create variants of the baseUrl with different params
export function downloadUrlBuilder(
  baseUrl: string,
  defaultParams: Record<string, string>,
): (params: Record<string, string>) => string {
  return function (params: Record<string, string>): string {
    const mergedParams = {...defaultParams, ...params}
    const isBrowser = typeof window !== `undefined`
    const url = new URL(baseUrl, isBrowser ? window.location.origin : '')
    for (const [key, value] of Object.entries(mergedParams)) {
      url.searchParams.append(key, value)
    }
    return url.toString()
  }
}
