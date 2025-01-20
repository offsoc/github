import {newRepoPath} from '@github-ui/paths'
import {RepoIcon} from '@primer/octicons-react'
import {Octicon} from '@primer/react'
import {Blankslate} from '@primer/react/drafts'

export interface UserInfo {
  directOrTeamMember: boolean
  admin: boolean
  canCreateRepository: boolean
}

interface Props {
  currentPage: number
  pageCount: number
  filtered?: boolean
  orgName?: string
  userInfo?: UserInfo
}

export function getNoRepoMessage({currentPage, filtered, pageCount, userInfo}: Omit<Props, 'orgName'>): string {
  const {directOrTeamMember, admin} = userInfo || {}
  if (pageCount > 0 && currentPage > pageCount) {
    return 'No more repositories. Visit a lower page.'
  } else if (filtered) {
    return 'No repositories matched your search.'
  } else if (admin) {
    return 'This organization has no repositories.'
  } else if (directOrTeamMember) {
    return "Your teams don't have access to any repositories."
  } else {
    return 'This organization has no public repositories.'
  }
}

export function NoReposMessage({currentPage, filtered, orgName, pageCount, userInfo}: Props) {
  const {directOrTeamMember, admin, canCreateRepository} = userInfo || {}

  const showRepoCreateButton = (() => {
    if (filtered) {
      return false
    }

    if (currentPage <= pageCount && (admin || directOrTeamMember)) {
      return canCreateRepository
    } else {
      return false
    }
  })()

  const message = getNoRepoMessage({currentPage, filtered, pageCount, userInfo})

  return (
    <Blankslate border={true}>
      <Blankslate.Visual>
        <Octicon icon={RepoIcon} size={24} />
      </Blankslate.Visual>
      <Blankslate.Heading>{message}</Blankslate.Heading>
      {filtered && <Blankslate.Description>Try a different search query</Blankslate.Description>}
      {showRepoCreateButton && (
        <Blankslate.PrimaryAction href={newRepoPath({org: orgName || ''})}>New repository</Blankslate.PrimaryAction>
      )}
    </Blankslate>
  )
}
