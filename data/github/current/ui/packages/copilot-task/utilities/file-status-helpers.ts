import type {FileStatus} from '@github-ui/web-commit-dialog'

export function isAdded(fileStatus?: FileStatus) {
  return fileStatus === 'A'
}

export function isModified(fileStatus?: FileStatus) {
  return fileStatus === 'M'
}

export function isDeleted(fileStatus?: FileStatus) {
  return fileStatus === 'D'
}
