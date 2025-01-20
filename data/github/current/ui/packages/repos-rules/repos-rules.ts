import {App} from './App'
import {OverviewPage} from './routes/OverviewPage'
import {RulesetPage} from './routes/RulesetPage'
import {InsightsPage} from './routes/InsightsPage'
import {HistoryComparisonPage} from './routes/HistoryComparisonPage'
import {HistorySummaryPage} from './routes/HistorySummaryPage'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'

const STANDARD_ROUTES = [
  jsonRoute({path: '/:owner/:repo/settings/rules', Component: OverviewPage}),
  jsonRoute({path: '/:owner/:repo/settings/rules/insights', Component: InsightsPage}),
  jsonRoute({path: '/:owner/:repo/settings/rules/:rulesetId', Component: RulesetPage}),
  jsonRoute({
    path: '/:owner/:repo/settings/rules/:rulesetId/history/:historyId/compare/*',
    Component: HistoryComparisonPage,
  }),
  jsonRoute({path: '/:owner/:repo/settings/rules/:rulesetId/history', Component: HistorySummaryPage}),
  /* Read only pages */
  jsonRoute({path: '/:owner/:repo/settings/rules/:rulesetId/history/:historyId/view', Component: RulesetPage}),
  jsonRoute({path: '/:owner/:repo/rules', Component: OverviewPage}),
  jsonRoute({path: '/:owner/:repo/rules/:rulesetId', Component: RulesetPage}),
  jsonRoute({path: '/:owner/:repo/rules/:rulesetId/history', Component: HistorySummaryPage}),
]

const STAFFTOOLS_ROUTES = [
  /* Stafftools */
  jsonRoute({path: '/stafftools/repositories/:owner/:repo/repository_rules', Component: OverviewPage}),
  jsonRoute({path: '/stafftools/repositories/:owner/:repo/repository_rules/insights', Component: InsightsPage}),
  jsonRoute({path: '/stafftools/repositories/:owner/:repo/repository_rules/:rulesetId', Component: RulesetPage}),
  jsonRoute({
    path: '/stafftools/repositories/:owner/:repo/repository_rules/:rulesetId/history/:historyId/compare/*',
    Component: HistoryComparisonPage,
  }),
  jsonRoute({
    path: '/stafftools/repositories/:owner/:repo/repository_rules/:rulesetId/history',
    Component: HistorySummaryPage,
  }),
  jsonRoute({path: '/stafftools/users/:organizationId/organization_rules', Component: OverviewPage}),
  jsonRoute({path: '/stafftools/users/:organizationId/organization_rules/insights', Component: InsightsPage}),
  jsonRoute({path: '/stafftools/users/:organizationId/organization_rules/:rulesetId', Component: RulesetPage}),
  jsonRoute({
    path: '/stafftools/users/:organizationId/organization_rules/:rulesetId/history/:historyId/compare/*',
    Component: HistoryComparisonPage,
  }),
  jsonRoute({
    path: '/stafftools/users/:organizationId/organization_rules/:rulesetId/history',
    Component: HistorySummaryPage,
  }),
]

const MEMBER_PRIVILEGE_ROUTES = [
  jsonRoute({path: '/organizations/:org/settings/member_privilege_rules', Component: OverviewPage}),
  jsonRoute({path: '/organizations/:org/settings/member_privilege_rules/:rulesetId', Component: RulesetPage}),

  jsonRoute({path: '/enterprises/:enterprise/settings/policies/repositories', Component: OverviewPage}),
  jsonRoute({path: '/enterprises/:enterprise/settings/policies/repositories/:rulesetId', Component: RulesetPage}),
]

registerReactAppFactory('repos-rules', () => ({
  App,
  routes: [...STANDARD_ROUTES, ...STAFFTOOLS_ROUTES, ...MEMBER_PRIVILEGE_ROUTES],
}))
