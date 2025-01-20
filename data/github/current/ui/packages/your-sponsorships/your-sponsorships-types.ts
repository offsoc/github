export interface SponsorshipData {
  // properties for all users
  id: string
  active: boolean
  pendingChange?: string // pending downgrades, upgrades, or cancellations
  sponsorableLogin: string
  sponsorableIsOrg: boolean // for square or circle avatar
  sponsorableAvatarUrl: string
  startDate: string
  viewerIsSponsor?: boolean

  // org member & org admin properties
  privacyLevel?: string

  // org admin properties
  amount?: string
  patreonLink?: string // existence of this means it's a patreon sponsorship
  subscribableId?: number // only manage sponsorships
  subscribedToNewsletterUpdates?: boolean

  // invoiced org property
  endDate?: string
}

export enum TabStates {
  ACTIVE_SPONSORSHIPS,
  PAST_SPONSORSHIPS,
}

export enum PrivacyLevel {
  PRIVATE = 'private',
  PUBLIC = 'public',
}

export enum EmailOptInValues {
  OPT_IN = 'on',
  OPT_OUT = 'off',
}
