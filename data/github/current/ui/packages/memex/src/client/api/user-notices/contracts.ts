/**
 * User Notices
 * =================
 * User notices are in-app announcements dismissable by a user.
 * They can be used to convey feature announcements, or to prompt users to take action.
 * For more information, see https://thehub.github.com/epd/engineering/products-and-services/dotcom/features/feature-notices/
 */
export const userNotices = [
  // This method demonstrates usage of this service, but it isn't a real notice.
  'memex_placeholder_notice',

  // Prompts users to rename a user-defined type column.
  'memex_issue_types_rename_prompt',
] as const

export type UserNotice = (typeof userNotices)[number]

export type EnabledUserNotices = UserNotice
export type EnabledUserNoticesMap = {[P in UserNotice]: boolean}

export const allUserNoticesDisabled = userNotices.reduce((map, current) => {
  map[current] = false
  return map
}, {} as EnabledUserNoticesMap)
