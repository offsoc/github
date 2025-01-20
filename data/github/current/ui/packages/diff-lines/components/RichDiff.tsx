import FileRendererBlob, {type FileRendererBlobData} from '@github-ui/file-renderer-blob'
import {SafeHTMLBox, type SafeHTMLString} from '@github-ui/safe-html'
import {Spinner} from '@primer/react'

export function RichDiff({
  dependencyDiffPath,
  fileRendererInfo,
  proseDiffHtml,
  loading,
}: {
  dependencyDiffPath?: string
  fileRendererInfo?: FileRendererBlobData
  loading: boolean
  proseDiffHtml?: SafeHTMLString
}) {
  if (loading) {
    return (
      <div className="d-flex flex-justify-center p-4">
        <Spinner size="large" />
      </div>
    )
  }

  if (proseDiffHtml) {
    return (
      <div className="prose-diff position-relative">
        <SafeHTMLBox html={proseDiffHtml} />
      </div>
    )
  } else if (fileRendererInfo) {
    return <FileRendererBlob {...fileRendererInfo} />
  } else if (dependencyDiffPath) {
    return (
      <include-fragment src={dependencyDiffPath}>
        <div className="text-center py-3">
          <Spinner size="medium" />
          <p className="color-fg-muted my-2">Loading Dependency Review...</p>
        </div>
      </include-fragment>
    )
  } else {
    return <div className="d-flex flex-justify-center p-4">This rich diff is not supported at the moment.</div>
  }
}
