import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'

export function buildIssue({title, databaseId}: {title: string; databaseId: number}) {
  return {
    id: mockRelayId(),
    title,
    databaseId,
    __typename: 'Issue',
  }
}

export function buildRepository({name, owner}: {name: string; owner: string}) {
  return {
    id: mockRelayId(),
    name,
    owner: {
      login: owner,
      name: owner,
    },
    isPrivate: false,
    isArchived: false,
    nameWithOwner: `${owner}/${name}`,
    __typename: 'Repository',
  }
}
