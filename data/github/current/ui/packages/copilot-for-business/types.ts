export enum CopilotForBusinessSeatPolicy {
  Disabled = 'disabled',
  EnabledForAll = 'enabled_for_all',
  EnabledForSelected = 'enabled_for_selected',
}

export enum SeatType {
  OrganizationInvitation = 'OrganizationInvitation',
  Team = 'Team',
  User = 'User',
  Organization = 'Organization',
  All = 'All',
  EnterpriseTeam = 'EnterpriseTeam',
}

export type SeatBreakdown = {
  seats_assigned: number
  seats_billed: number
  seats_pending: number
  description: string
}

export type CopilotForBusinessTrial = {
  started: boolean
  ended: boolean
  has_trial: boolean
  upgradable: boolean
  cancelable: boolean
  days_left: number
  started_at: string
  ends_at: string
  trial_length: number
  active: boolean
  expired: boolean
  pending: boolean
  copilot_plan: string
}

export type CopilotForBusinessPayload = {
  policy: CopilotForBusinessSeatPolicy
  public_code_suggestions_configured: boolean
  seats: {
    seats: CopilotSeatAssignment[]
    count: number
    pending_requests?: {
      requesters: Requester[]
      count: number
    }
    licenses: CopilotLicenseIdentifiers
  }
  organization: CopilotForBusinessOrganization
  business?: CopilotForBusinessBusiness
  seat_breakdown: SeatBreakdown
  business_trial?: CopilotForBusinessTrial
  render_trial_expired_banner: boolean
  can_add_teams: boolean
  members_count: number
  can_allow_to_assign_seats_on_business: boolean
  next_billing_date: string
  plan_text: 'Business' | 'Enterprise'
  featureRequestInfo: FeatureRequestInfo
  render_pending_downgrade_banner: boolean
  docsUrls: {
    managing_policies: string
  }
}

export type CopilotLicenseIdentifiers = {
  user_ids: number[]
  team_ids: number[]
  invite_user_ids: number[]
  invite_emails: string[]
}

export type CopilotForBusinessOrganization = {
  name: string
  id: number
  billable: boolean
  has_seat: boolean
  add_seat_link: string | null
}

export type CopilotForBusinessBusiness = {
  name: string
  slug: string
}

export type CopilotForBusinessTeam = {
  id?: number
  login: string
  slug: string
  avatar_url: string
  combined_slug: string
  member_count: number
  member_ids: number[]
}

export type CopilotEnterpriseTeam = {
  id: number
  login: string
  slug: string
  mapping_id?: number // this points to the external group mapping id
  member_count: number
  member_ids: number[]
}

export type CopilotSeatAssignable = {
  id: number
  login?: string
  avatar_url?: string
  display_name?: string
  slug?: string
  combined_slug?: string
  member_count?: number
  member_ids?: number[]
  email?: string
  invitee?: CopilotSeatAssignable
  invitee_id?: number
  mapping_id?: number
}

export type CopilotSeatAssignment<
  Type extends SeatType = SeatType,
  Assignable extends CopilotSeatAssignable = CopilotSeatAssignable,
> = {
  assignable: Assignable
  assignable_type: Type
  id?: number | null
  invitation_date?: string
  invitation_expired?: boolean
  last_activity_at?: string
  pending_cancellation_date?: string | null
}

export type EnterpriseTeamAssignmentStatus =
  | 'pending_creation'
  | 'pending_unassignment'
  | 'pending_reassignment'
  | 'pending_cancellation'
  | 'stable'
export type EnterpriseTeamSeatAssignment = CopilotSeatAssignment<SeatType.EnterpriseTeam, CopilotEnterpriseTeam> & {
  status?: EnterpriseTeamAssignmentStatus
}

type SortType = 'pending_cancelled' | 'use' | 'name' | 'requested_at' | 'member_count'
type SortOrder = 'asc' | 'desc'
export type SortName = `${SortType}_${SortOrder}`

export type SortDetails = {
  type: string
  order: string
}

export type SearchUser = {
  avatar: string
  display_login: string
  profile_name: string
  org_member: boolean
  is_user: boolean
}

export type SearchTeam = {
  avatar: string
  name: string
  slug: string
  members_count: number
}

export type SearchUsersPayload = {
  users: SearchUser[]
}

export type SearchTeamsPayload = {
  teams: SearchTeam[]
}
export type CSVUser = {
  id: number
  email: string
  display_login: string
  profile_name: string
  avatar: string
  is_new_user: boolean
}

export type CSVUploadPayload = {
  // Number of users outside of the org
  new_users: number
  // Users retrieved from the DB via their display login
  github_users: CSVUser[]
  // Users retrieved from the DB via their email address
  email_users: string[]
  // The number of invalid user logins or emails
  found_errors: string[]
  // Total number of users
  total_users: number
}

export type AutocompleteItem = {text: string; id: string}

export type MenuItem = {
  id: string
  selected: boolean
  title: string
  description: string
  value: string
}

type CopilotForBusinessPolicy = {
  manages: string
  configurable: boolean
  options: MenuItem[]
  visible: boolean | null
}

type BingGitHubChatPolicy = {
  manages: string
  configurable: boolean
  enabled: boolean
  options: MenuItem[]
  visible: boolean | null
}

type UserFeedbackPolicy = {
  manages: string
  configurable: boolean
  visible: boolean | null
  enabled: boolean
}

type BetaFeaturesPolicy = {
  manages: string
  configurable: boolean
  visible: boolean | null
  enabled: boolean
}

export type CopilotForBusinessPoliciesPayload = {
  org_name: string
  copilot_plan: string
  editor_chat: CopilotForBusinessPolicy
  mobile_chat: CopilotForBusinessPolicy
  snippy: CopilotForBusinessPolicy
  cli: CopilotForBusinessPolicy
  copilot_for_dotcom: CopilotForBusinessPolicy
  bing_github_chat: BingGitHubChatPolicy
  copilot_user_feedback_opt_in: UserFeedbackPolicy
  copilot_beta_features_opt_in: BetaFeaturesPolicy
  copilot_extensions: CopilotForBusinessPolicy
  private_telemetry: CopilotForBusinessPolicy
  copilot_usage_metrics_policy: CopilotForBusinessPolicy
  enterprise_name: string | null
  enterprise_slug: string | null
  docsUrls: {
    generalPrivacyStatement: string
  }
}

export type DependentLicense = {
  type: 'dependent'
  name: string
}

export type DirectLicense = {
  type: 'direct'
}

export type FeatureRequest = {
  id: number
  requested_at: string
}

export type FeatureRequestInfo = {
  showFeatureRequest: boolean
  alreadyRequested: boolean
  dismissed: boolean
  featureName: string
  requestPath: string
  isEnterpriseRequest?: boolean
  dismissedAt?: string
  billingEntityId?: string
  latestUsernameRequests: string[]
  amountOfUserRequests: number
}

export type Requester = {
  id: number
  display_login: string
  profile_name: string | null
  requested_at?: string
}

export type UserAssignable = {
  id: number
  avatar_url: string
  display_login: string
  org_member: boolean
  profile_name: string | null
  type: SeatType.User
  license?: DependentLicense | DirectLicense
  feature_request?: FeatureRequest
}

export type TeamAssignable = {
  id: number
  avatar_url: string
  member_ids: number[]
  name: string
  slug: string
  org_member: boolean
  license?: DirectLicense
  type: SeatType.Team
}

export type InvitationAssignable = {
  id?: number
  avatar_url?: string
  display_login: string
  org_member: boolean
  type: SeatType.OrganizationInvitation
  license?: DirectLicense
  profile_name?: string | null
}
export type SeatAssignable = UserAssignable | TeamAssignable | InvitationAssignable
export type MemberAssignables = SeatAssignable[]

export type AssignablesResponse = {
  assignables: MemberAssignables
  total: number
}

export type PlanText = 'Business' | 'Enterprise'

export type CheckboxTypes = SeatType.User | SeatType.Team | SeatType.OrganizationInvitation
