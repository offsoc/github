import type {DiffLineType} from '@github-ui/diffs/types'
import type {FeatureRequestInfo} from '@github-ui/feature-request/types'
import type {SafeHTMLString} from '@github-ui/safe-html'

import type {ReposFileTreeData} from './tree-types'
import type {StylingDirectivesDocument} from './blob-types'
import type {FilePagePayload} from './code-view-types'

import type {BypassMetadata} from '@github-ui/secret-scanning'

export function isEditPayload(payload: FilePagePayload): payload is EditBlobPagePayload {
  return 'editInfo' in payload && 'webCommitInfo' in payload
}

export interface EditBlobPagePayload extends FilePagePayload {
  fileTree: ReposFileTreeData
  editInfo: EditInfo
  webCommitInfo: WebCommitInfo
}

export interface EditInfo {
  banners: EditorBanners
  binary: boolean
  codeMirror?: CodeMirrorInfo
  content: string | null
  customSlashCommandsDocsUrl: string
  editors: EditorInfo
  enableCommitButton: boolean
  fileName: string
  helpUrl: string
  isNewFile: boolean
  isOnboardingGuidance: boolean
  markdownDocsUrl: string
  pickers: EditorPickers
  previewEditPath: string
  renderableExtensions: string[]
  slashCommandsEnabled: boolean
  customSlashCommandsEnabled: boolean
  secretPushProtectionHelpUrl: string
  uploadPolicyPath: string
  uploadExtensions: string[]
}

export type CanCommitStatus = 'blocked' | 'can_bypass' | 'allowed'

export interface WebCommitInfo {
  authorEmails: string[]
  canCommitStatus: CanCommitStatus
  commitOid: string
  dcoSignoffEnabled: boolean
  dcoSignoffHelpUrl?: string
  defaultEmail: string
  defaultNewBranchName: string
  forkedRepo?: ForkedRepoInfo
  guidanceTask?: string
  lockedOnMigration: boolean
  pr: string
  protectionNotEnforcedInfo?: ProtectionNotEnforcedInfo
  repoHeadEmpty: boolean
  saveUrl: string
  shouldFork: boolean
  shouldUpdate: boolean
  suggestionsUrlEmoji: string
  suggestionsUrlIssue: string
  suggestionsUrlMention: string
}

export interface ForkedRepoInfo {
  name: string
  owner: string
  id: string
}

export interface ProtectionNotEnforcedInfo {
  editRepositoryRulesetsPath: string
  editRepositoryBranchesPath: string
  branchProtected: boolean
  rulesetsProtected: boolean
  organization: boolean
  featureRequestInfo: FeatureRequestInfo
  upsellCtaInfo: UpsellCtaInfo
}

export type UpsellCtaInfo = {
  visible: boolean
  cta: {
    showUpgradeButton: boolean
    askAdmin: boolean
    ctaPath?: string
  }
}

interface CodeMirrorInfo extends CodeMirrorSpacingOptions {
  showFileActions: boolean
}

export interface EditorInfo {
  actionsEnabled: boolean
  dependabotEditorEnabled: boolean
  devcontainerEditorEnabled: boolean
  isEnterprise: boolean
  isProxima: boolean
  repositoryActionsEnabled: boolean
  repositoryActionsReadinessPath: string
}

interface EditorPickers {
  licensePickerAvailable: boolean
  licenseToolPath: string
  codeOfConductPickerAvailable: boolean
  codeOfConductToolPath: string
}

interface EditorBanners {
  citationHelpUrl: string
  editRepoPath: string
  /**
   * The detected encoding that will be replaced when the file is committed.
   */
  hasMixedLineEndings?: boolean
  orgProfileReadmeCalloutEnabled: boolean
  orgMemberProfileReadmeCalloutEnabled: boolean
  profileReadmeCalloutEnabled: boolean
  replacedDetectedEncoding?: string
  repositoryCitationTemplateUrl: string
  repositoryFundingLinksEnabled: boolean
  sponsorsEnabled: boolean
}

export interface SaveResponse {
  data: {
    redirect?: string
    message?: string
    commitQuorumPollPath?: string
    error?: string
    error_details?: SaveResponseErrorDetails
    secretBypassMetadata?: BypassMetadata
  }
}

export interface SaveResponseErrorDetails {
  ruleViolations?: string[]
}

export interface DiffResponse {
  data: {
    html: SafeHTMLString | null
    diffLines: DiffLines[] | null
    rawLines: string[] | null
    stylingDirectives: StylingDirectivesDocument | null
    message: string | null
    messageHtml: string | null
    displayData: DiffDislayInfo | null
    fundingLinks: FundingData | null
  }
}

export interface FundingData {
  externalAccounts: Array<{
    link: string
    platform: string
  }>
  sponsorableOrg: string | null
  sponsorableUsers: string[]
  errors: string[]
  reportAbuseLink: string | null
  hasValidPlatform: boolean
}

export interface DiffDislayInfo {
  displayUrl: string
  identityUuid: string
  renderFileType: string
  size: number
}

export interface DiffLines {
  rightLine: DiffLine
  leftLine: DiffLine
}

export interface DiffLine {
  left: number
  html: string
  noNewLine: boolean
  right: number
  type: DiffLineType
}

export const enum BypassReason {
  FALSE_POSITIVE = 'false_positive',
  USED_IN_TESTS = 'used_in_tests',
  WILL_FIX_LATER = 'will_fix_later',
}

export interface SidepanelDocsHtml {
  workflow: string
  issueForm: string
  issueTemplate: string
  discussionTemplate: string
}

export interface SidepanelMarketplaceUrls {
  workflow: string
  devcontainers: string
}

export interface CodeMirrorSpacingOptions {
  indentMode?: 'tab' | 'space'
  indentSize?: '2' | '4' | '8'
  lineWrapping?: 'on' | 'off'
}
