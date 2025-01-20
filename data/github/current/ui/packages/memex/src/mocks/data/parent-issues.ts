import type {ParentIssue} from '../../client/api/common-contracts'

export const mockParentIssues = new Array<ParentIssue>(
  {
    id: 1,
    globalRelayId: 'I_kwARTg',
    number: 10,
    title: 'Parent One',
    state: 'open',
    nwoReference: 'github/sriracha-4#10',
    url: 'http://github.localhost:80/github/sriracha-4/issues/14',
    owner: 'github',
    repository: 'sriracha-4',
    subIssueList: {
      total: 1,
      completed: 0,
      percentCompleted: 0,
    },
  },
  {
    id: 2,
    globalRelayId: 'I_kwARSw',
    number: 11,
    title: 'Parent Two',
    state: 'closed',
    stateReason: 'completed',
    nwoReference: 'github/sriracha-4#11',
    url: 'http://github.localhost:80/github/sriracha-4/issues/15',
    owner: 'github',
    repository: 'sriracha-4',
    subIssueList: {
      total: 1,
      completed: 0,
      percentCompleted: 0,
    },
  },
  {
    id: 3,
    globalRelayId: 'I_kwARS2',
    number: 12,
    title: 'Parent Three',
    state: 'closed',
    stateReason: 'not_planned',
    nwoReference: 'github/sriracha-4#12',
    url: 'http://github.localhost:80/github/sriracha-4/issues/16',
    owner: 'github',
    repository: 'sriracha-4',
    subIssueList: {
      total: 1,
      completed: 0,
      percentCompleted: 0,
    },
  },
)
