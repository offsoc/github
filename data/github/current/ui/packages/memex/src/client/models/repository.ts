import {not_typesafe_nonNullAssertion} from '../helpers/non-null-assertion'

type RepositoryWithOwner = {
  name: string
  owner: string
}

export function repositoryWithOwnerFromString(repoWithOwner: string): RepositoryWithOwner | undefined {
  const parts = repoWithOwner.split('/')
  if (parts.length !== 2) {
    return undefined
  } else {
    return {
      owner: not_typesafe_nonNullAssertion(parts[0]),
      name: not_typesafe_nonNullAssertion(parts[1]),
    }
  }
}
