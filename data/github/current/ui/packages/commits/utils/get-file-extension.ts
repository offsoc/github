import {NO_FILE_EXTENSION} from '@github-ui/diff-file-tree/file-filter'

export function getFileExtension(path: string) {
  if (!path) {
    return ''
  }

  const lastPeriodIndex = path.lastIndexOf('.')

  if (!lastPeriodIndex || lastPeriodIndex < 0) {
    return NO_FILE_EXTENSION
  }

  return `.${path.substring(lastPeriodIndex + 1)}`
}
