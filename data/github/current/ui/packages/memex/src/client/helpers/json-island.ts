import type {MemexChart} from '../api/charts/contracts/api'
import type {MemexColumn} from '../api/columns/contracts/memex-column'
import type {Owner, Privileges, User} from '../api/common-contracts'
import type {CreatedWithTemplateMemex} from '../api/created-with-template-memex/api'
import type {EnabledFeatures} from '../api/enabled-features/contracts'
import type {
  Memex,
  MemexLimits,
  MemexMetricsData,
  MemexRelayIDs,
  MemexServiceData,
  MemexStatus,
  SystemTemplate,
} from '../api/memex/contracts'
import type {MemexItem} from '../api/memex-items/contracts'
import type {PaginatedMemexItemsData} from '../api/memex-items/paginated-views'
import type {ProjectMigration} from '../api/project-migration/contracts'
import type {UserNotice} from '../api/user-notices/contracts'
import type {PageView} from '../api/view/contracts'
import type {MemexWorkflowConfiguration, MemexWorkflowPersisted} from '../api/workflows/contracts'
import type {AliveConfig, ApiMetadataJSONIsland} from '../services/types'
import type {ThemePreferences} from './color-modes'

/**
 * GitHub runtime represents whether the server is running GitHub.com or GitHub Enterprise.
 */
export type Runtime = 'dotcom' | 'enterprise'

type ThemeKey = 'Dark' | 'Light'
type KeyWithLightAndDark<T extends string> = `${T}${ThemeKey}`
type FeedbackUrls = {url: string; issue_viewer_url: string; pwl_beta_url: string}

type DefaultMediaLookup = {
  [key in KeyWithLightAndDark<string>]: string
}

type InsightsChartLimitDialogKey = 'banner'
type InsightsChartLimitDialogLookup = {
  [key in KeyWithLightAndDark<InsightsChartLimitDialogKey>]: string
}

export type MediaUrlKeyLookup = {
  projectTemplateDialog: string
  insightsChartLimitDialog: InsightsChartLimitDialogKey
  issueTypes: string
}

export type MediaUrls = {
  projectTemplateDialog: DefaultMediaLookup
  insightsChartLimitDialog: InsightsChartLimitDialogLookup
  issueTypes: DefaultMediaLookup
}

export type LoggedInUser = Pick<User, 'id' | 'login' | 'name' | 'avatarUrl'> & {
  global_relay_id: string
  paste_url_link_as_plain_text?: boolean
  use_single_key_shortcut?: boolean
  isSpammy: boolean
}

export type JSONIslandData = ApiMetadataJSONIsland & {
  'memex-columns-data': Array<MemexColumn>
  'memex-enabled-features': Array<EnabledFeatures>
  'reserved-column-names': Array<string>
  'theme-preferences': ThemePreferences
  'media-urls': MediaUrls
  'memex-creator': User
  'memex-owner': Owner
  'memex-viewer-privileges': Privileges
  'memex-feedback': FeedbackUrls
  'archive-alpha-feedback': {url: string}
  'memex-views': Array<PageView>
  'memex-data': Memex
  'created-with-template-memex': CreatedWithTemplateMemex
  'logged-in-user': LoggedInUser
  'memex-items-data': Array<MemexItem>
  'memex-paginated-items-data': PaginatedMemexItemsData
  'memex-workflow-configurations-data': Array<MemexWorkflowConfiguration>
  'memex-workflows-data': Array<MemexWorkflowPersisted>
  'memex-refresh-events': Array<string>
  'memex-alive': AliveConfig
  'memex-charts-data': Array<MemexChart>
  'memex-limits': MemexLimits
  'memex-relay-ids': MemexRelayIDs
  'memex-project-migration': ProjectMigration
  'memex-templates': string
  'memex-system-templates': Array<SystemTemplate>
  'github-runtime': Runtime
  'github-version-number': string
  'github-billing-enabled': boolean
  'copy-memex-project-partial-data': {url: string}
  'github-url': string
  'latest-memex-project-status': MemexStatus
  'memex-viewer-subscribed': boolean
  'memex-user-notices': Array<UserNotice>
  'memex-service': MemexServiceData
  'memex-consistency-metrics-data': MemexMetricsData
}

/**
 * If there is a <script /> tag in the DOM with the provided ID, this function
 * will parse its text content as JSON and return it. Otherwise, it will return undefined.
 * @param elementId id for the <script /> in the DOM to attempt to fetch data from
 */
export function fetchJSONIslandData<TIslandDataKey extends keyof JSONIslandData>(
  elementId: TIslandDataKey,
): JSONIslandData[TIslandDataKey] | undefined {
  const jsonIsland = document.getElementById(elementId)
  if (jsonIsland && jsonIsland.textContent) {
    try {
      return JSON.parse(jsonIsland.textContent) as JSONIslandData[TIslandDataKey]
    } catch {
      return undefined
    }
  } else {
    return undefined
  }
}
