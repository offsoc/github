import type {User} from './user'

export type SecurityCampaignForm = {
  name: string
  description: string
  endsAt: string
  manager: User | null
}

export type SecurityCampaign = SecurityCampaignForm & {
  createdAt: string
  updatePath: string
  deletePath: string
  closePath: string
  reopenPath: string
}
