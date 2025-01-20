export const TestEnvironment = {
  Dev: 'dev',
  Dotcom: 'dotcom',
} as const
export type TestEnvironment = ObjectValues<typeof TestEnvironment>

export type StagingPages =
  | 'integrationTestsEmpty'
  | 'integrationTestsEmptyUserOwned'
  | 'integrationTestsWithItems'
  | 'appWithDateItems'
  | 'integrationTestsWithCustomItems'
  | 'integrationTestsP50'
  | 'integrationTestsP99'
  | 'integrationTestsPaginatedData'
  | 'integrationTests42Views'
  | 'integrationTestsInErrorMode'
  | 'integrationTestsWithTitleColumnHidden'
  | 'integrationTestsWithOnlyTitleColumn'
  | 'integrationTestsWithPartialData'
  | 'integrationTestsWithSavedViews'
  | 'integrationTestsWithCustomMilestoneData'
  | 'integrationTestsWithCustomAssigneesData'
  | 'integrationTestsWithoutMilestoneData'
  | 'integrationTestsInAdminMode'
  | 'integrationTestsInAdminErrorMode'
  | 'integrationTestsInUserOwnedMode'
  | 'integrationTestsInReadonlyMode'
  | 'integrationTestSettingsPage'
  | 'integrationTestAccessSettingsPage'
  | 'integrationTestSettingsFieldPage'
  | 'integrationTestMemexTemplates'
  | 'integrationTestMemexTemplatesInErrorMode'
  | 'integrationTestCustomTemplates'
  | 'integrationTestCustomTemplatesCanCopyAsTemplate'
  | 'integrationTestNoSuggestedRepos'
  | 'integrationTestNoItemsInRepo'
  | 'integrationTestsInEnterpriseMode'
  | 'integrationTestsClosed'
  | 'integrationTestWorkflowsPage'
  | 'integrationTestArchivePage'
  | 'appWithIterationsField'
  | 'appWithReasonField'
  | 'appWithTrackedByField'
  | 'appWithRoadmapLayout'
  | 'appWithBoardLayout'
  | 'integrationTestPresence'
  | 'integrationTestLiveUpdates'
  | 'integrationTestErrorBoundary'
  | 'insights'
  | 'insightsErrorMode'
  | 'insightsRedactionMode'
  | 'integrationTestsWithIssueTypeRenamePopover'
  // these appear to be unused -> review and cleanup later
  | 'reactTableWithItems'
  | 'integrationTestsWithStatusUpdates'
  | 'integrationTestsWithSubIssues'

type UrlStore = {
  [key in StagingPages]: {[env: string]: string}
}

const StoryUrls: UrlStore = {
  reactTableWithItems: {
    [TestEnvironment.Dev]: `orgs/app/projects/1`,
  },
  integrationTestsEmpty: {
    [TestEnvironment.Dev]: `orgs/integration/projects/100`,
  },
  integrationTestsEmptyUserOwned: {
    [TestEnvironment.Dev]: `users/monalisa/projects/101`,
  },
  integrationTestsWithItems: {
    [TestEnvironment.Dev]: `orgs/integration/projects/1`,
  },
  integrationTestsWithCustomItems: {
    [TestEnvironment.Dev]: `orgs/integration/projects/2`,
  },
  integrationTestsP50: {
    [TestEnvironment.Dev]: `orgs/integration/projects/3`,
  },
  integrationTestsP99: {
    [TestEnvironment.Dev]: `orgs/integration/projects/4`,
  },
  integrationTestsPaginatedData: {
    [TestEnvironment.Dev]: `orgs/integration/projects/400`,
  },
  integrationTestsInErrorMode: {
    [TestEnvironment.Dev]: `orgs/integration/projects/5`,
  },
  integrationTestsWithTitleColumnHidden: {
    [TestEnvironment.Dev]: `orgs/integration/projects/6`,
  },
  integrationTestsWithOnlyTitleColumn: {
    [TestEnvironment.Dev]: `orgs/integration/projects/7`,
  },
  integrationTestsWithPartialData: {
    [TestEnvironment.Dev]: `orgs/integration/projects/8`,
  },
  appWithDateItems: {
    [TestEnvironment.Dev]: `orgs/app/projects/5`,
  },
  integrationTestsWithSavedViews: {
    [TestEnvironment.Dev]: `orgs/integration/projects/9`,
  },
  appWithIterationsField: {
    [TestEnvironment.Dev]: `orgs/app/projects/7`,
  },
  appWithReasonField: {
    [TestEnvironment.Dev]: `orgs/app/projects/8`,
  },
  appWithTrackedByField: {
    [TestEnvironment.Dev]: `orgs/app/projects/9`,
  },
  appWithBoardLayout: {
    [TestEnvironment.Dev]: `orgs/app/projects/2`,
  },
  appWithRoadmapLayout: {
    [TestEnvironment.Dev]: `orgs/app/projects/200`,
  },
  integrationTestsWithCustomMilestoneData: {
    [TestEnvironment.Dev]: `orgs/integration/projects/12`,
  },
  integrationTestsWithCustomAssigneesData: {
    [TestEnvironment.Dev]: `orgs/integration/projects/1234`,
  },
  integrationTestsWithoutMilestoneData: {
    [TestEnvironment.Dev]: `orgs/integration/projects/19`,
  },
  integrationTestsInAdminMode: {
    [TestEnvironment.Dev]: `orgs/integration/projects/13`,
  },
  integrationTestsInAdminErrorMode: {
    [TestEnvironment.Dev]: `orgs/integration/projects/18`,
  },
  integrationTestsInReadonlyMode: {
    [TestEnvironment.Dev]: `orgs/integration/projects/14`,
  },
  integrationTestSettingsPage: {
    [TestEnvironment.Dev]: `orgs/integration/projects/15/settings`,
  },
  integrationTestSettingsFieldPage: {
    [TestEnvironment.Dev]: `orgs/integration/projects/16/settings/fields/Status`,
  },
  integrationTestWorkflowsPage: {
    [TestEnvironment.Dev]: `orgs/integration/projects/17/workflows`,
  },
  integrationTestAccessSettingsPage: {
    [TestEnvironment.Dev]: `orgs/integration/projects/21/settings/access`,
  },
  integrationTestArchivePage: {
    [TestEnvironment.Dev]: `orgs/integration/projects/40/archive`,
  },
  integrationTestsInUserOwnedMode: {
    [TestEnvironment.Dev]: `users/integration/projects/13`,
  },
  integrationTestPresence: {
    [TestEnvironment.Dev]: `orgs/integration/projects/22`,
  },
  integrationTestLiveUpdates: {
    [TestEnvironment.Dev]: `orgs/integration/projects/23`,
  },
  integrationTestErrorBoundary: {
    [TestEnvironment.Dev]: `orgs/integration/projects/500`,
  },
  integrationTestMemexTemplates: {
    [TestEnvironment.Dev]: `orgs/integration/projects/32`,
  },
  integrationTestMemexTemplatesInErrorMode: {
    [TestEnvironment.Dev]: `orgs/integration/projects/33`,
  },
  integrationTestCustomTemplates: {
    [TestEnvironment.Dev]: `orgs/integration/projects/60`,
  },
  integrationTestCustomTemplatesCanCopyAsTemplate: {
    [TestEnvironment.Dev]: `orgs/integration/projects/61`,
  },
  integrationTestNoSuggestedRepos: {
    [TestEnvironment.Dev]: `orgs/integration/projects/34`,
  },
  integrationTestNoItemsInRepo: {
    [TestEnvironment.Dev]: `orgs/integration/projects/35`,
  },
  integrationTestsInEnterpriseMode: {
    [TestEnvironment.Dev]: `orgs/integration/projects/36`,
  },
  integrationTestsClosed: {
    [TestEnvironment.Dev]: `orgs/integration/projects/37`,
  },
  integrationTests42Views: {
    [TestEnvironment.Dev]: `orgs/integration/projects/442/views/42`,
  },
  insights: {
    [TestEnvironment.Dev]: `orgs/integration/projects/39/insights`,
  },
  insightsErrorMode: {
    [TestEnvironment.Dev]: `orgs/integration/projects/530/insights`,
  },
  insightsRedactionMode: {
    [TestEnvironment.Dev]: `orgs/integration/projects/531/insights`,
  },
  integrationTestsWithStatusUpdates: {
    [TestEnvironment.Dev]: `orgs/integration/projects/39`,
  },
  integrationTestsWithSubIssues: {
    [TestEnvironment.Dev]: `orgs/integration/projects/44`,
  },
  integrationTestsWithIssueTypeRenamePopover: {
    [TestEnvironment.Dev]: 'orgs/integration/projects/43',
  },
}

function getBaseUrl(environment = getTestEnvironment()) {
  if (environment === TestEnvironment.Dotcom) {
    return process.env['MEMEX_TEST_BASEURL_PRODUCT'] ?? 'http://github.localhost/'
  } else if (environment === TestEnvironment.Dev) {
    return process.env['MEMEX_TEST_BASEURL_STAGING'] ?? 'http://localhost:9091/'
  } else {
    throw new Error(`Unrecognized TestEnvironment: ${environment}`)
  }
}

/**
 * Retrive the type of environment used for these tests
 *
 * Defaults to `TestEnvironment.Dev` if no environment variable set
 */
export function getTestEnvironment() {
  const environment = process.env['MEMEX_TEST_ENVIRONMENT']?.toLowerCase()
  switch (environment) {
    case 'dotcom':
      return TestEnvironment.Dotcom
    default:
      return TestEnvironment.Dev
  }
}

/**
 * Convert a given staging page into the environment-specific URL
 *
 * Will throw if it cannot find a valid URL, as not all environments have the
 * same set of URLs defined.
 */
export function getUrl(key: StagingPages) {
  const env = getTestEnvironment()
  const fragment = StoryUrls[key]?.[env]
  if (!fragment) {
    throw new Error(`Url for key ${key} not found.`)
  }
  return `${getBaseUrl()}${fragment}`
}
