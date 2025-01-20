import {NO_FILE_EXTENSION} from '@github-ui/diff-file-tree/file-filter'

import type {FileData} from './filter-files'

type SummaryDeltaPath = string | undefined

export function getFileExtension(file: FileData | SummaryDeltaPath): string {
  let path: string | null | undefined
  if (typeof file === 'string') {
    path = file
  } else {
    path = file?.newPath || file?.oldPath
  }
  const lastPeriodIndex = path?.lastIndexOf('.')
  if (!path) {
    return ''
  }
  if (!lastPeriodIndex || lastPeriodIndex < 0) {
    return NO_FILE_EXTENSION as string
  }

  return `.${path.substring(lastPeriodIndex + 1)}`
}
