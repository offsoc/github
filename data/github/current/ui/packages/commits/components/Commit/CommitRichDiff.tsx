import {RichDiff} from '@github-ui/diff-lines'
import type {FileRendererBlobData} from '@github-ui/file-renderer-blob'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {memo} from 'react'

import {useLoadRichDiffData} from '../../hooks/use-load-rich-diff-data'

export const CommitRichDiff = memo(function CommitRichDiff({
  commitOid,
  path,
  proseDiffHtml,
  fileRendererInfo,
  dependencyDiffPath,
}: {
  commitOid: string
  path: string
  proseDiffHtml?: SafeHTMLString
  fileRendererInfo?: FileRendererBlobData
  dependencyDiffPath?: string
}) {
  const {loaded, richDiffData} = useLoadRichDiffData(
    commitOid,
    {proseDiffHtml, fileRendererInfo},
    path,
    dependencyDiffPath,
  )

  return (
    <RichDiff
      dependencyDiffPath={dependencyDiffPath}
      fileRendererInfo={richDiffData.fileRendererInfo}
      loading={!loaded}
      proseDiffHtml={richDiffData.proseDiffHtml}
    />
  )
})
