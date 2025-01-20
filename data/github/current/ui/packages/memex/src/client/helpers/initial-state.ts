import type {PartialFailure} from '../api/columns/contracts/memex-column'
import {DefaultPrivileges} from '../api/common-contracts'
import type {ThemePreferences} from './color-modes'
import {fetchJSONIslandData, type JSONIslandData, type Runtime} from './json-island'

type InitialStateData = {
  themePreferences: JSONIslandData['theme-preferences']
  mediaUrls: JSONIslandData['media-urls'] | undefined
  loggedInUser: JSONIslandData['logged-in-user'] | undefined
  projectData: JSONIslandData['memex-data'] | undefined
  projectOwner: JSONIslandData['memex-owner'] | undefined
  projectCreator: JSONIslandData['memex-creator'] | undefined
  projectLimits: JSONIslandData['memex-limits']
  relayIds: JSONIslandData['memex-relay-ids'] | undefined
  viewerPrivileges: JSONIslandData['memex-viewer-privileges']
  feedbackLink: JSONIslandData['memex-feedback']['url']
  issueViewerFeedbackLink: JSONIslandData['memex-feedback']['issue_viewer_url']
  pwlBetaFeedbackLink: JSONIslandData['memex-feedback']['pwl_beta_url']
  archiveAlphaFeedbackLink?: JSONIslandData['archive-alpha-feedback']['url']
  isOrganization: boolean
  githubRuntime: Runtime
  isDotcomRuntime: boolean
  isEnterpriseRuntime: boolean
  isBillingEnabled: boolean
  showTemplateDialog: boolean
  partialFailures?: Array<PartialFailure>
  copyProjectPartialUrl: JSONIslandData['copy-memex-project-partial-data']['url']
  createdWithTemplateMemex?: JSONIslandData['created-with-template-memex']
  systemTemplates?: JSONIslandData['memex-system-templates']
  betaOptoutUrl?: JSONIslandData['memex-without-limits-beta-optout-api-data']['url']
}

let initialState: InitialStateData | undefined = undefined

const defaultThemePreferences: ThemePreferences = {
  mode: undefined,
  light: undefined,
  dark: undefined,
  markdown_fixed_width_font: false,
  preferred_emoji_skin_tone: undefined,
}

/**
 * Lazily reads Initial State data from the JSON Island and caches it into a variable
 * so that we do not read from the JSON Island on subsequent calls
 * @returns A object containing several pieces of json island data. All of this data is
 * read-only and will not change for the life-cycle of the app
 */
export function getInitialState() {
  if (!initialState) {
    const projectOwner = fetchJSONIslandData('memex-owner')
    const projectData = fetchJSONIslandData('memex-data')
    const githubRuntime = fetchJSONIslandData('github-runtime') ?? 'dotcom'
    const githubBillingEnabled = fetchJSONIslandData('github-billing-enabled') ?? false
    const feedback = fetchJSONIslandData('memex-feedback')

    initialState = {
      themePreferences: fetchJSONIslandData('theme-preferences') ?? defaultThemePreferences,
      mediaUrls: fetchJSONIslandData('media-urls'),
      loggedInUser: fetchJSONIslandData('logged-in-user'),
      projectData,
      projectOwner,
      projectCreator: fetchJSONIslandData('memex-creator'),
      projectLimits: {
        projectItemLimit: 1200,
        projectItemArchiveLimit: 10_000,
        limitedChartsLimit: 2,
        singleSelectColumnOptionsLimit: 25,
        autoAddCreationLimit: 4,
        viewsLimit: 50,
        ...fetchJSONIslandData('memex-limits'),
      },
      relayIds: fetchJSONIslandData('memex-relay-ids'),
      viewerPrivileges: fetchJSONIslandData('memex-viewer-privileges') ?? DefaultPrivileges,
      feedbackLink: feedback?.url ?? 'https://github.com/github/feedback/discussions/categories/issues-feedback',
      issueViewerFeedbackLink:
        feedback?.issue_viewer_url ?? 'https://github.com/github/feedback/discussions/categories/issues-feedback',
      pwlBetaFeedbackLink: feedback?.pwl_beta_url ?? 'https://github.com/orgs/community/discussions/106785',
      archiveAlphaFeedbackLink: fetchJSONIslandData('archive-alpha-feedback')?.url,
      isOrganization: projectOwner?.type === 'organization',
      githubRuntime,
      isDotcomRuntime: githubRuntime === 'dotcom',
      isEnterpriseRuntime: githubRuntime === 'enterprise',
      isBillingEnabled: githubBillingEnabled,
      showTemplateDialog: !!fetchJSONIslandData('memex-templates'),
      createdWithTemplateMemex: fetchJSONIslandData('created-with-template-memex'),
      partialFailures: fetchJSONIslandData('memex-columns-data')?.reduce((acc, cur) => {
        if (cur.partialFailures) {
          return acc.concat(cur.partialFailures)
        }
        return acc
      }, [] as Array<PartialFailure>),
      copyProjectPartialUrl: fetchJSONIslandData('copy-memex-project-partial-data')?.url ?? '',
      systemTemplates: fetchJSONIslandData('memex-system-templates'),
      betaOptoutUrl: fetchJSONIslandData('memex-without-limits-beta-optout-api-data')?.url,
    } as const
  }
  return initialState
}

/**
 * Test helper to force us to re-read this initial state
 * from the JSON Island after every test.
 *
 * Should only be called within tests
 */
export function resetInitialState() {
  initialState = undefined
}

/**
 * Determine if any more single-select column options can be added to a column.
 * @param options The current list of options, if any
 * @returns True if the user has reached the limit of single-select column options
 */
export function isOptionLimitReached<T>(options?: Array<T> | undefined): boolean {
  if (!options) return false
  return options.length >= getInitialState().projectLimits.singleSelectColumnOptionsLimit
}
