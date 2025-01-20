import type {User} from '../../client/api/common-contracts'
import {getThemePreferencesFromThemeProps} from '../../client/helpers/color-modes'
import {IssueTypesByRepository} from '../../mocks/data/issue-types'
import {DefaultSuggestedLabels} from '../../mocks/data/labels'
import {DefaultMemex} from '../../mocks/data/memexes'
import {MilestonesByRepository} from '../../mocks/data/milestones'
import {mockParentIssues} from '../../mocks/data/parent-issues'
import {DefaultIssuesMetadata} from '../../mocks/data/side-panel-metadata'
import {DefaultSuggestedRepositories} from '../../mocks/data/suggestions'
import {DefaultTeam} from '../../mocks/data/teams'
import {DefaultSystemTemplates} from '../../mocks/data/templates'
import {DefaultCollaborator, DefaultSuggestedAssignees, getMemexOwner, getUser} from '../../mocks/data/users'
import {
  closedWorkflowMigratedPersisted,
  closedWorkflowPersisted,
  DefaultWorkflowConfigurations,
  mergedWorkflowPersisted,
} from '../../mocks/data/workflows'
import {generateEnabledFeaturesFromURL} from '../../mocks/generate-enabled-features-from-url'
import {TrackedByItems} from '../../mocks/memex-items/tracked-issues'
import {DefaultColumns, DefaultViews} from '../../mocks/mock-data'
import {MockServer, type ServerUrlData} from '../../mocks/server/mock-server'
import type {StoryDefinition} from '../story-definitions'
import {getViewerPrivileges} from './get-viewer-privileges'

const DEFAULT_SIMULATED_LATENCY = 500

export function initMockServer(storyDefinition: StoryDefinition, urlData?: ServerUrlData) {
  const views = storyDefinition.initialViews || DefaultViews
  const privileges = getViewerPrivileges(storyDefinition.viewerPrivileges)
  const params = new URLSearchParams(location.search)
  const logged_out = params.get('_logged_out') === '1'

  const mockServer = new MockServer({
    jsonIslandData: {
      'memex-data': {
        ...(storyDefinition.initialMemex || DefaultMemex),
        number: storyDefinition.projectNumber === 'new' ? -1 : storyDefinition.projectNumber,
      },
      'memex-items-data': storyDefinition.initialItems || [],
      'memex-columns-data': storyDefinition.initialColumns || DefaultColumns,
      'memex-views': views,
      'reserved-column-names': ['reserved-column-name'],
      'memex-viewer-privileges': privileges,
      'logged-in-user':
        storyDefinition.loggedInUser && !logged_out
          ? {
              id: storyDefinition.loggedInUser.id,
              name: storyDefinition.loggedInUser.name,
              login: storyDefinition.loggedInUser.login,
              avatarUrl: storyDefinition.loggedInUser.avatarUrl,
              global_relay_id: storyDefinition.loggedInUser.id.toString(), // TODO: this should be a relay id, not a user id
              paste_url_link_as_plain_text: storyDefinition.loggedInUser.paste_url_link_as_plain_text,
              use_single_key_shortcut: storyDefinition.loggedInUser.use_single_key_shortcut,
              isSpammy: storyDefinition.loggedInUser.isSpammy,
            }
          : undefined,
      'memex-owner': getMemexOwner(storyDefinition.ownerType),
      'memex-creator': (storyDefinition.loggedInUser as User) || getUser('glortho'),
      'memex-workflow-configurations-data': DefaultWorkflowConfigurations,
      'memex-workflows-data': [closedWorkflowPersisted, mergedWorkflowPersisted, closedWorkflowMigratedPersisted],
      'theme-preferences': getThemePreferencesFromThemeProps(storyDefinition.themeProps),
      'memex-enabled-features': generateEnabledFeaturesFromURL(),
      'memex-templates': storyDefinition.memexTemplates || undefined,
      'memex-system-templates': storyDefinition.memexSystemTemplates ?? DefaultSystemTemplates,
      'memex-limits': {
        projectItemLimit: 1200,
        projectItemArchiveLimit: 10_000,
        limitedChartsLimit: 2,
        singleSelectColumnOptionsLimit: 25,
        autoAddCreationLimit: 4,
        viewsLimit: 50,
        ...storyDefinition.projectLimits,
      },
      'memex-relay-ids': {
        memexProject: 'PVT_1234',
      },
      'github-runtime': storyDefinition.githubRuntime || 'dotcom',
      'github-billing-enabled':
        storyDefinition.githubBillingEnabled === undefined ? true : storyDefinition.githubBillingEnabled,
      'created-with-template-memex': storyDefinition.createdWithTemplateMemex || undefined,
      'github-url': 'https://github.com',
      'memex-viewer-subscribed': false,
      'memex-user-notices': storyDefinition.userNotices,
    },

    suggestedRepositories: storyDefinition.suggestedRepositories ?? DefaultSuggestedRepositories,
    suggestedAssignees: DefaultSuggestedAssignees,
    suggestedLabels: DefaultSuggestedLabels,
    suggestedMilestones: MilestonesByRepository,
    suggestedIssueTypes: IssueTypesByRepository,
    parentIssues: mockParentIssues,
    collaborators: [DefaultCollaborator, DefaultTeam],
    sleepMs: storyDefinition.sleepMs ?? DEFAULT_SIMULATED_LATENCY,
    issues: DefaultIssuesMetadata,
    enableRedaction: storyDefinition.enableRedaction,
    trackedBy: TrackedByItems,
    templates: storyDefinition.organizationTemplates ?? [],
    statuses: storyDefinition.statuses,
  })

  mockServer.seedJSONIslandData(urlData)
  return mockServer
}
