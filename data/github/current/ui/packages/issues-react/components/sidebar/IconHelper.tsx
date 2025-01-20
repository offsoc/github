import {
  AlertIcon,
  BeakerIcon,
  BookmarkIcon,
  BriefcaseIcon,
  BugIcon,
  CalendarIcon,
  ClockIcon,
  CodeReviewIcon,
  CodescanIcon,
  CommentDiscussionIcon,
  DependabotIcon,
  EyeIcon,
  FileDiffIcon,
  FlameIcon,
  GitPullRequestIcon,
  HubotIcon,
  type Icon,
  IssueOpenedIcon,
  MentionIcon,
  MeterIcon,
  MoonIcon,
  NorthStarIcon,
  OrganizationIcon,
  PeopleIcon,
  RocketIcon,
  SmileyIcon,
  SquirrelIcon,
  SunIcon,
  TelescopeIcon,
  TerminalIcon,
  ToolsIcon,
  ZapIcon,
} from '@primer/octicons-react'

import {VALUES} from '../../constants/values'

export function iconToPrimerIcon(iconName: string) {
  if (KNOWN_VIEW_ICONS_TO_PRIMER_ICON[iconName]) {
    return KNOWN_VIEW_ICONS_TO_PRIMER_ICON[iconName]
  } else if (CUSTOM_VIEW_ICONS_TO_PRIMER_ICON[iconName]) {
    return CUSTOM_VIEW_ICONS_TO_PRIMER_ICON[iconName]
  }

  return CUSTOM_VIEW_ICONS_TO_PRIMER_ICON[VALUES.defaultViewIcon]
}

export function customViewIconToPrimerIcon(iconName: string) {
  if (CUSTOM_VIEW_ICONS_TO_PRIMER_ICON[iconName]) {
    return CUSTOM_VIEW_ICONS_TO_PRIMER_ICON[iconName]
  }

  return CUSTOM_VIEW_ICONS_TO_PRIMER_ICON[VALUES.defaultViewIcon]
}

const KNOWN_VIEW_ICONS_TO_PRIMER_ICON: Record<string, Icon> = {
  PEOPLE: PeopleIcon,
  SMILEY: SmileyIcon,
  MENTION: MentionIcon,
  CLOCK: ClockIcon,
  GIT_PULL_REQUEST: GitPullRequestIcon,
}

export const CUSTOM_VIEW_ICONS_TO_PRIMER_ICON: Record<string, Icon> = {
  ZAP: ZapIcon,
  ISSUE_OPENED: IssueOpenedIcon,
  GIT_PULL_REQUEST: GitPullRequestIcon,
  COMMENT_DISCUSSION: CommentDiscussionIcon,
  ORGANIZATION: OrganizationIcon,
  PEOPLE: PeopleIcon,
  BRIEFCASE: BriefcaseIcon,
  FILE_DIFF: FileDiffIcon,
  CODE_REVIEW: CodeReviewIcon,
  CODESCAN: CodescanIcon,
  TERMINAL: TerminalIcon,
  TOOLS: ToolsIcon,
  BEAKER: BeakerIcon,
  ALERT: AlertIcon,
  EYE: EyeIcon,
  TELESCOPE: TelescopeIcon,
  BOOKMARK: BookmarkIcon,
  CALENDAR: CalendarIcon,
  METER: MeterIcon,
  MOON: MoonIcon,
  SUN: SunIcon,
  FLAME: FlameIcon,
  BUG: BugIcon,
  NORTH_STAR: NorthStarIcon,
  ROCKET: RocketIcon,
  SQUIRREL: SquirrelIcon,
  HUBOT: HubotIcon,
  DEPENDABOT: DependabotIcon,
  SMILEY: SmileyIcon,
  MENTION: MentionIcon,
  CLOCK: ClockIcon,
}
