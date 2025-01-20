import {IssueState, type Owner} from '../../client/api/common-contracts'
import type {TrackedByItem} from '../../client/api/issues-graph/contracts'
import {displayNameWithOwner, fullDisplayName} from '../../client/helpers/tracked-by-formatter'

const trackedByItem: TrackedByItem = {
  key: {
    ownerId: 1243,
    itemId: 24242,
    primaryKey: {
      uuid: '2424242',
    },
  },
  state: IssueState.Open,
  completion: undefined,
  url: 'https://github.com/github/memex/issues/2222',
  title: 'some title',
  repoId: 5555,
  labels: [],
  assignees: [],
  userName: 'github',
  repoName: 'memex',
  number: 2222,
}

describe('fullDisplayName', () => {
  it('matches expected value', () => {
    expect(fullDisplayName(trackedByItem)).toBe('github/memex#2222')
  })
})

describe('displayNameWithOwner', () => {
  it('renders full name when owner is omitted', () => {
    expect(displayNameWithOwner(trackedByItem)).toBe('github/memex#2222')
  })

  it('renders shortened name when owner matches userName', () => {
    const owner: Owner = {
      type: 'organization',
      id: 1341242,
      login: 'github',
      name: 'GitHub',
      avatarUrl: 'https://github.com/github.png',
    }

    expect(displayNameWithOwner(trackedByItem, owner)).toBe('memex#2222')
  })

  it('renders full name when owner does not match userName', () => {
    const owner: Owner = {
      type: 'organization',
      id: 245252,
      login: 'microsoft',
      name: 'Microsoft',
      avatarUrl: 'https://github.com/microsoft.png',
    }

    expect(displayNameWithOwner(trackedByItem, owner)).toBe('github/memex#2222')
  })
})
