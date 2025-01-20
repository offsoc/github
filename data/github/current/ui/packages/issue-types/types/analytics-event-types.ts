export type IssueTypesTargetType = REPO_ISSUE_TYPE_SETTINGS_ELEMENTS | ORG_ISSUE_TYPE_SETTINGS_ELEMENTS

type REPO_ISSUE_TYPE_SETTINGS_ELEMENTS = 'REPO_ISSUE_TYPE_TOGGLE'
type ORG_ISSUE_TYPE_SETTINGS_ELEMENTS =
  | 'ORG_ISSUE_TYPE_CREATE_BUTTON'
  | 'ORG_ISSUE_TYPE_ENABLE_BUTTON'
  | 'ORG_ISSUE_TYPE_DISABLE_BUTTON'
  | 'ORG_ISSUE_TYPE_DELETE_BUTTON'
  | 'ORG_ISSUE_TYPE_LIST_ITEM_MENU_OPTION'
  | 'ORG_ISSUE_TYPES_EXCLUDE_REPO_BUTTON'

export type IssueTypesEventType = REPO_EVENTS | ORG_EVENTS

type REPO_EVENTS = 'repo_issue_type.enable' | 'repo_issue_type.disable'
type ORG_EVENTS =
  | 'org_issue_type.create'
  | 'org_issue_type.enable'
  | 'org_issue_type.disable'
  | 'org_issue_type.delete'
  | 'org_issue_types.exclude_repo'
