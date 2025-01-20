import {authorData1, generateCommitMessages, sampleCommitRowData} from '../test-utils/mock-data'
import type {CommitGroup} from '../types/commits-types'
import type {Commit} from '../types/shared'

export function generateCommitGroups(
  groupCount: number,
  commitsPerGroup: number,
  randomizeMessages = false,
): CommitGroup[] {
  const commitGroups = []
  const commits: Commit[] = []
  for (let i = 0; i < commitsPerGroup; i++) {
    let tempCommitData = {...sampleCommitRowData}

    if (i === 0) {
      tempCommitData.authors = [authorData1]
    }

    if (randomizeMessages) {
      tempCommitData = {...tempCommitData, ...generateCommitMessages()}
    }
    tempCommitData.oid = `${i}${tempCommitData.oid.substring(1)}`
    commits.push(tempCommitData)
  }
  for (let i = 0; i < groupCount; i++) {
    commitGroups.push({
      title: `this is a date and title${i}`,
      commits,
    })
  }

  return commitGroups
}
