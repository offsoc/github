import type {SafeHTMLString} from '@github-ui/safe-html'

import type {FilePagePayload} from './code-view-types'

export interface FileBlobPagePayload extends FilePagePayload {
  blob: BlobPayload
  blame?: Blame
}

export function isBlobPayload(payload: FilePagePayload): payload is FileBlobPagePayload {
  return 'blob' in payload
}

export function isBlamePayload(payload: FilePagePayload): payload is FileBlobPagePayload & {blame: Blame} {
  return isBlobPayload(payload) && 'blame' in payload
}

interface BlackbirdPosition {
  line_number: number
  utf16_col: number
}
interface BlackbirdSymbolRange {
  start: BlackbirdPosition
  end: BlackbirdPosition
}

export interface BlackbirdSymbol {
  kind: string | number
  name: string
  fully_qualified_name: string
  ident_utf16: BlackbirdSymbolRange
  extent_utf16: BlackbirdSymbolRange
}

export interface DeferredAST {
  stylingDirectives: StylingDirectivesDocument | null
}

export interface DeferredMetadata {
  showLicenseMeta: boolean
  license: {
    name: string
    description: SafeHTMLString
    rules: {[key: string]: LicenseRule[]}
  } | null
  codeownerInfo: CodeOwnerInfo
  newDiscussionPath: string | null
  newIssuePath: string | null
}

export interface BlobPayload {
  colorizedLines: SafeHTMLString[] | null
  csv: SafeHTMLString[][] | null
  csvError: SafeHTMLString | null
  dependabotInfo: DependabotInfo
  displayName: string
  displayUrl: string
  errorMessage?: string
  discussionTemplate?: YamlTemplate
  headerInfo: {
    blobSize: string
    deleteTooltip: string
    editTooltip: string
    ghDesktopPath: string | null
    isGitLfs: boolean
    lineInfo: {
      truncatedLoc: string
      truncatedSloc: string
    }
    isCSV: boolean
    isRichtext: boolean
    mode: string
    onBranch: boolean
    shortPath: string
    siteNavLoginPath: string
    toc: TocEntry[] | null
  }

  image: boolean
  isCodeownersFile: boolean
  isPlain: boolean
  issueTemplate: YamlTemplate | null
  showIssueFormWarning: boolean
  isValidLegacyIssueTemplate: boolean
  language: string
  languageID?: number
  large: boolean
  planSupportInfo: PlanSupportInfo
  publishBannersInfo: {
    dismissActionNoticePath: string
    releasePath: string
    showPublishActionBanner: boolean
  }
  rawLines: string[] | null
  renderedFileInfo: {
    identityUUID: string
    renderFileType: string
    size: number
  } | null
  rawBlobUrl: string
  renderImageOrRaw: boolean
  richText: SafeHTMLString | null
  shortPath: string | null
  stylingDirectives?: StylingDirectivesDocument
  symbols: BlackbirdSymbolInfo
  symbolsEnabled: boolean
  tabSize: number
  timedOut?: boolean
  topBannersInfo: {
    overridingGlobalFundingFile: boolean
    globalPreferredFundingPath: string | null
    showInvalidCitationWarning: boolean
    citationHelpUrl: string
    actionsOnboardingTip: {
      mediaUrl: string
      mediaPreviewSrc: string
      taskTitle: string
      taskPath: string
      iconSvg: SafeHTMLString
      orgName: string
    } | null
  }
  truncated: boolean
  viewable: boolean
  workflowRedirectUrl: string | null
}

export type StylingDirectivesDocument = StylingDirectivesLine[]

export type StylingDirectivesLine = StylingDirective[]

/*
  s = start of the directive
  e = endo f the directive
  c = cssClass for the directive
*/
export interface StylingDirective {
  s: number
  e: number
  c: string
}

interface BlackbirdSymbolInfo {
  not_analyzed: boolean
  timed_out: boolean
  symbols: BlackbirdSymbol[]
}
interface LicenseRule {
  tag: string
  label: string
  description: string
}

export interface PlanSupportInfo {
  repoIsFork: boolean
  repoOwnedByCurrentUser: boolean
  requestFullPath: string
  showFreeOrgGatedFeatureMessage: boolean
  showPlanSupportBanner: boolean
  upgradeDataAttributes: {[key: string]: string}
  upgradePath: string
}

interface DependabotInfo {
  showConfigurationBanner: boolean
  configFilePath: string
  networkDependabotPath: string
  dismissConfigurationNoticePath: string
  configurationNoticeDismissed: boolean
}

export interface CodeOwnerInfo {
  codeownerPath: string | null
  ownedByCurrentUser: boolean | null
  ownersForFile: string | null
  ruleForPathLine: string | null
}

export interface CodeownersError {
  column: number
  // The deep transformation of the keys isn't hitting this
  end_column: number | null
  kind: string
  line: number
  source: string
  suggestion: string | null
}

export interface SplitCodeownersError extends CodeownersError {
  lineError: string
  linePrefix: string
  lineSuffix: string
}

export interface TocEntry {
  level: number
  htmlText: SafeHTMLString
  anchor: string
}

export interface YamlTemplate {
  about?: string
  assignees?: string
  errors: Array<{link: string; message: SafeHTMLString}>
  inputs: TemplateFormInput[]
  labels?: string
  projects?: string
  name?: string
  structured?: boolean
  title?: string
  valid: boolean
  type?: string
}

export interface TemplateFormInput {
  checkboxes?: Array<{id: string; label: string; required: boolean}>
  description?: SafeHTMLString
  label?: string
  id?: string
  multiple?: boolean
  options?: string[]
  placeholder?: string
  render?: string | null
  required?: boolean
  type: TemplateFormInputType
  value?: SafeHTMLString | null
}

export type TemplateFormInputType = 'checkboxes' | 'dropdown' | 'input' | 'markdown' | 'textarea'

export type CodeNavResultsBackend =
  | 'ALEPH_PRECISE'
  | 'ALEPH_PRECISE_PREVIEW'
  | 'ALEPH_PRECISE_DEVELOPMENT'
  | 'BLACKBIRD'

export interface Blame {
  ranges: {[lineno: number]: BlameRange}
  commits: {[commitOid: string]: BlameCommit}
  ignoreRevs: {path: string; present: boolean; timedOut: boolean}
  errorType?: 'symlink_disallowed' | 'invalid_ignore_revs' | 'ignore_revs_too_big' | 'blame_timeout'
}

export interface BlameRange {
  start: number
  oldStart: number
  end: number
  oldEnd: number
  commitOid: string
  reblamePath?: string
}

export interface BlameCommit {
  oid: string
  message: SafeHTMLString
  shortMessageHtmlLink: SafeHTMLString
  authorAvatarUrl: string | null
  committerName: string
  committerEmail: string
  committedDate: string
  firstParentOid: string
}

export type PanelType = 'codeNav' | 'toc' | 'edit'
