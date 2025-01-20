import {GitHubAvatar} from '@github-ui/github-avatar'

export const RepoAvatar = ({ownerLogin, ownerType, size}: {ownerLogin: string; ownerType: string; size: number}) => {
  return <GitHubAvatar src={`/${ownerLogin}.png?s=40`} square={ownerType === 'Organization'} size={size} />
}
