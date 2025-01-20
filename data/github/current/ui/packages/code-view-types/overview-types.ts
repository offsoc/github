import type {FilePagePayload} from './code-view-types'
import type {FileTreePagePayload, ReadmeBlobPayload} from './tree-types'

export interface FileOverviewPayload extends FileTreePagePayload {
  overview: OverviewPayload
}

export function isFileOverviewPayload(payload: FilePagePayload): payload is FileOverviewPayload {
  return 'overview' in payload
}

export interface OverviewPayload {
  codeButton: CodeButton
  createFromTemplatePath: string
  banners: {
    shouldRecommendReadme: boolean
    isPersonalRepo: boolean
    showUseActionBanner: boolean
    actionSlug: string | undefined
    actionId: number | undefined
    showProtectBranchBanner: boolean | undefined
    publishBannersInfo: {
      dismissActionNoticePath: string
      releasePath: string
      showPublishActionBanner: boolean
    }
    interactionLimitBanner?: InteractionLimitBanner
    showInvitationBanner: boolean
    inviterName: string | undefined
    actionsMigrationBannerInfo: {
      releaseTags: string[]
      showImmutableActionsMigrationBanner: boolean
      initialMigrationStatus: string | null
    }
  }
  commitCount: string
  overviewFiles: RepoOverviewBlobPayload[] | undefined
  popovers: {
    rename: BranchRename | null
    renamedParentRepo: {
      nameWithOwner: string
      branchName: string
    } | null
  }
  templateButton?: {
    codespacesPath: string
    templateRepoId: string
    templateRef: string
  }
}

export interface CodeButton {
  codespacesEnabled: boolean
  hasAccessToCodespaces: boolean
  repoPolicyInfo?: RepoPolicyInfo
  contactPath: string
  currentUserIsEnterpriseManaged: boolean
  enterpriseManagedBusinessName?: string
  isEnterprise: boolean
  newCodespacePath?: string
  local: {
    protocolInfo: {
      httpAvailable: boolean
      sshAvailable: boolean
      httpUrl: string
      showCloneWarning: boolean
      sshUrl: string
      sshCertificatesRequired: boolean
      sshCertificatesAvailable: boolean
      ghCliUrl: string
      defaultProtocol: string
      newSshKeyUrl: string
      setProtocolPath: string
    }
    platformInfo: {
      cloneUrl: string
      visualStudioCloneUrl: string
      xcodeCloneUrl: string
      zipballUrl: string
      showVisualStudioCloneButton: boolean
      showXcodeCloneButton: boolean
    }
  }
}

export interface RepoPolicyInfo {
  allowed: boolean
  canBill: boolean
  hasIpAllowLists: boolean
  disabledByBusiness: boolean
  disabledByOrganization: boolean
  changesWouldBeSafe: boolean
}

export interface BranchRename {
  oldName: string
  shellOldName: string
  newName: string
  shellNewName: string
  shellEscapingDocsURL?: string
}

export interface InteractionLimitBanner {
  adminLink: string | null
  adminText: string | null
  currentExpiry: string
  disablePath: string | null
  limitTitle: string
  inOrganization: boolean
  usersHaveAccess: boolean
  contributorsHaveAccess: boolean
}

export interface RecentlyTouchedBranch {
  branchName: string
  comparePath: string
  date: string
  repoName: string
  repoOwner: string
}

export enum PreferredFileTypes {
  README = 'readme',
  CODE_OF_CONDUCT = 'code_of_conduct',
  LICENSE = 'license',
  SECURITY = 'security',
}

export interface RepoOverviewBlobPayload extends ReadmeBlobPayload {
  path: string
  refName: string
  repoName: string
  preferredFileType: PreferredFileTypes
  tabName?: string
  loaded: boolean
}
