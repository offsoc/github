import type {IssueType} from '../../client/api/common-contracts'
import {getRepository} from './repositories'

export const mockIssueTypes = new Array<IssueType>(
  {
    id: 22,
    name: 'Batch',
    color: 'BLUE',
  },
  {
    id: 23,
    name: 'Bug',
    description: 'Report an unexpected problem or unintended behavior',
    color: 'RED',
  },
  {
    id: 24,
    name: 'Epic',
    color: 'GREEN',
  },
  {
    id: 25,
    name: 'Feature',
    description: '',
    color: 'PURPLE',
  },
  {
    id: 26,
    name: 'Initiative',
    description: '',
    color: 'ORANGE',
  },
  {
    id: 27,
    name: 'Task',
    description: 'Outline a slice of work significant enough to capture meaningful progress or value',
  },
)

const memexRepo = getRepository(1)
const githubRepo = getRepository(2)
const railsRepo = getRepository(3)

export const IssueTypesByRepository = new Map<number, Array<IssueType>>([
  [memexRepo.id, mockIssueTypes],
  [githubRepo.id, mockIssueTypes],
  [railsRepo.id, []], // Emulate "disabled" state for a repo
])

export const getIssueType = (id: number) => {
  const issueType = mockIssueTypes.find(i => i.id === id)
  if (!issueType) {
    throw Error(`Unable to find issue type with id ${id} - please check the mock data`)
  }

  return issueType
}

export const mockSuggestedIssueTypes = mockIssueTypes.map(issueType => ({...issueType, selected: false}))

export const getSuggestedIssueTypesWithSelection = (selectedIndices: Array<number>) => {
  return mockSuggestedIssueTypes.map((issueType, index) => {
    if (selectedIndices.includes(index)) return {...issueType, selected: true}
    else return issueType
  })
}
