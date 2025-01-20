import type {DiffEntryData} from '@github-ui/diff-lines'

import type {CommitFile, DiffEntryDataWithExtraInfo} from '../types/commit-types'

export function splitDiffEntryData(
  data: DiffEntryDataWithExtraInfo[] | Array<Pick<DiffEntryData, 'path' | 'status' | 'pathDigest'>>,
): [DiffEntryDataWithExtraInfo[], CommitFile[]] {
  const lastIndexOfCompleteDiffData =
    data.findIndex(diffEntry => {
      return (diffEntry as DiffEntryDataWithExtraInfo).oldOid === undefined
    }) - 1

  let completeDiffData: DiffEntryDataWithExtraInfo[]
  // No incomplete diff data
  if (lastIndexOfCompleteDiffData === -2) {
    completeDiffData = data as DiffEntryDataWithExtraInfo[]
  } else {
    completeDiffData = data.slice(0, lastIndexOfCompleteDiffData + 1) as DiffEntryDataWithExtraInfo[]
  }

  const fileTreeData: CommitFile[] = data.map(diffEntry => {
    return {
      path: diffEntry.path,
      changeType: diffEntry.status,
      pathDigest: diffEntry.pathDigest,
    }
  })

  return [completeDiffData, fileTreeData]
}
