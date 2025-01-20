import {FileIcon} from '@primer/octicons-react'

interface Props {
  uploadUrl: string
}

export function Dropzone({uploadUrl}: Props) {
  return (
    <div
      className="repo-file-upload-tree-target js-document-dropzone js-upload-manifest-tree-view"
      data-testid="dragzone"
      data-drop-url={uploadUrl}
    >
      <div className="repo-file-upload-outline">
        <div className="repo-file-upload-slate">
          <div className="fgColor-muted">
            <FileIcon size={32} />
          </div>
          <h2 aria-hidden="true">Drop to upload your files</h2>
        </div>
      </div>
    </div>
  )
}
