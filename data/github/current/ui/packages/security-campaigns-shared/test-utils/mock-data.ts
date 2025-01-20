import type {SecurityCampaign} from '../types/security-campaign'
import type {User} from '../types/user'

export function getUser(data?: Partial<User>): User {
  return {
    id: 2,
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/ghost?size=40',
    ...data,
  }
}

export function getSecurityCampaign(): SecurityCampaign {
  return {
    name: 'User-controlled code injection',
    description:
      'Directly evaluating user input (for example, an HTTP request parameter) as code without first sanitizing the input allows an attacker arbitrary code execution.',
    endsAt: '2024-05-12T00:00:00.000Z',
    manager: getUser(),
    createdAt: '2024-05-01T00:00:00.000Z',
    updatePath: '/orgs/github/security/campaigns/1',
    deletePath: '/orgs/github/security/campaigns/1',
    closePath: '/orgs/github/security/campaigns/1/close',
    reopenPath: '/orgs/github/security/campaigns/1/reopen',
  }
}
