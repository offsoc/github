import {addWeeks} from 'date-fns'

import {type Milestone, MilestoneState} from '../../client/api/common-contracts'
import {dateStringFromISODate} from '../../client/helpers/date-string-from-iso-string'
import {getRepository} from './repositories'

function getDateWeeksFromNow(weeks: number) {
  return dateStringFromISODate(addWeeks(new Date(), weeks).toISOString())
}

const milestonesForMemex = new Array<Milestone>(
  {
    id: 2,
    title: 'v0.1 - Prioritized Lists?',
    url: 'https://github.com/github/memex/milestone/2',
    state: MilestoneState.Closed,
    repoNameWithOwner: 'github/memex',
  },
  {
    id: 3,
    title: 'v1.0 - Limited Beta',
    url: 'https://github.com/github/memex/milestone/3',
    state: MilestoneState.Open,
    repoNameWithOwner: 'github/memex',
    dueDate: getDateWeeksFromNow(-1),
  },
  {
    id: 4,
    title: 'Sprint 9',
    url: 'https://github.com/github/memex/milestone/4',
    state: MilestoneState.Open,
    repoNameWithOwner: 'github/memex',
    dueDate: getDateWeeksFromNow(2),
  },
  {
    id: 5,
    title: 'Sprint 10',
    url: 'https://github.com/github/memex/milestone/5',
    state: MilestoneState.Open,
    repoNameWithOwner: 'github/memex',
    dueDate: getDateWeeksFromNow(3),
  },
  {
    id: 20,
    title: 'Sprint 10',
    url: 'https://github.com/github/memex/milestone/20',
    state: MilestoneState.Open,
    repoNameWithOwner: 'github/github',
    dueDate: getDateWeeksFromNow(3),
  },
)

const milestonesForGitHubRepo = new Array<Milestone>(
  {
    id: 6,
    title: 'Sprint 9',
    url: 'https://github.com/github/github/milestone/6',
    state: MilestoneState.Open,
    repoNameWithOwner: 'github/github',
    dueDate: getDateWeeksFromNow(1),
  },
  {
    id: 7,
    title: 'Sprint 10',
    url: 'https://github.com/github/github/milestone/7',
    state: MilestoneState.Open,
    repoNameWithOwner: 'github/github',
    dueDate: getDateWeeksFromNow(2),
  },
)

const milestonesForRailsRepo = new Array<Milestone>(
  {
    id: 8,
    title: 'Sprint 9',
    url: 'https://github.com/rails/rails/milestone/8',
    state: MilestoneState.Open,
    repoNameWithOwner: 'rails/rails',
    dueDate: getDateWeeksFromNow(1),
  },
  {
    id: 9,
    title: 'New Release',
    url: 'https://github.com/rails/rails/milestone/9',
    state: MilestoneState.Open,
    repoNameWithOwner: 'rails/rails',
    dueDate: getDateWeeksFromNow(2),
  },
)

export const getMilestoneByRepository = (repositoryId: number, milestoneId: number) => {
  const milestones = MilestonesByRepository.get(repositoryId)

  if (!milestones) {
    throw Error(`Unable to find milestones for repository id ${repositoryId} - please check the mock data`)
  }

  const milestone = milestones.find(m => m.id === milestoneId)
  if (!milestone) {
    throw Error(
      `Unable to find milestone with id ${milestoneId} in repository ${repositoryId} - please check the mock data`,
    )
  }

  return milestone
}

const memexRepo = getRepository(1)
const githubRepo = getRepository(2)
const railsRepo = getRepository(3)

export const MilestonesByRepository = new Map<number, Array<Milestone>>([
  [memexRepo.id, milestonesForMemex],
  [githubRepo.id, milestonesForGitHubRepo],
  [railsRepo.id, milestonesForRailsRepo],
])

export const mockSuggestedMilestones = milestonesForMemex.map(milestone => ({...milestone, selected: false}))

export const getSuggestedMilestonesWithSelection = (selectedIndices: Array<number>) => {
  return mockSuggestedMilestones.map((milestone, index) => {
    if (selectedIndices.includes(index)) return {...milestone, selected: true}
    else return milestone
  })
}
