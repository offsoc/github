export interface BypassMetadata {
  token_label: string
  owner_display_login: string
  repo_name: string
  placeholder_ksuid: string
  is_custom_pattern: boolean
  limited_user_bypass_experience_only: boolean
  push_protection_custom_message?: PushProtectionCustomMessage
  repo_has_secret_scanning_experience: boolean
  first_secret_location?: SecretLocation
  use_delegated_bypass_flow: boolean
  rule_suite_id?: number
}

export type PushProtectionOwnerType = 'organization' | 'enterprise'

export interface PushProtectionCustomMessage {
  message: string
  owner_name: string
  owner_type: PushProtectionOwnerType
}

export interface SecretLocation {
  start_line: number
  end_line: number
  start_line_byte_position: number
  end_line_byte_position: number
}

export const enum BypassReason {
  FalsePositive = 'false_positive',
  UsedInTests = 'used_in_tests',
  WillFixLater = 'will_fix_later',
}
