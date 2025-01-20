// @ts-check
const {pathFromRoot} = require('./config-paths')

/**
 * @type {{
 *   root: string
 *   src: string
 *   sources: Record<string, string>
 *   excludes: string[]
 *   projects: Record<string, {
 *     schema: string
 *     schemaExtensions: string[]
 *     customScalarTypes: Record<string, string>
 *     persist: {
 *       file: string[]
 *     }
 *   }>
 * }}
 */
module.exports = {
  /** The path root from which sources are evaluated  */
  root: pathFromRoot(''),
  /** A Map of source path to project name, ie 'app/assets/modules/pulls-dashboard': 'github-ui */
  sources: Object.fromEntries(
    [
      'app/assets/modules/pulls-dashboard',
      'app/assets/modules/react-shared/Notifications',
      'app/assets/modules/repo-deployments',
      'ui/packages/billing-app',
      'ui/packages/commenting',
      'ui/packages/contributor-footer',
      'ui/packages/commits',
      'ui/packages/copilot-code-chat',
      'ui/packages/copilot-pr-review-banner',
      'ui/packages/copilot-task',
      'ui/packages/filter/providers',
      'ui/packages/issue-actions',
      'ui/packages/issue-body',
      'ui/packages/issue-create',
      'ui/packages/issue-form',
      'ui/packages/issue-metadata',
      'ui/packages/issue-types',
      'ui/packages/issue-viewer',
      'ui/packages/issues-react',
      'ui/packages/item-picker',
      'ui/packages/item-picker2',
      'ui/packages/list-view-items-issues-prs',
      'ui/packages/markdown-edit-history-viewer',
      'ui/packages/memex',
      'ui/packages/mergebox',
      'ui/packages/navigation-test',
      'ui/packages/notifications-inbox',
      'ui/packages/pull-request-viewer',
      'ui/packages/query-builder/providers',
      'ui/packages/react-sandbox',
      'ui/packages/reaction-viewer',
      'ui/packages/relay-test-utils',
      'ui/packages/sub-issues',
      'ui/packages/timeline-items',
      'ui/packages/global-create-menu',
    ].map(source => {
      return [source, 'github-ui']
    }),
  ),
  /** A list of patterns to exclude from compilation. Usually generated / already compiled graphql files */
  excludes: ['**/__generated__/**'],
  /** A map of projects (like github-ui) to their project level config */
  projects: {
    'github-ui': {
      /** the graphql schema to utilize */
      schema: 'config/schema.internal.graphql',
      /** a list of paths to schema extensions */
      schemaExtensions: ['ui/packages/relay-environment/graphql', 'ui/packages/issues-react/graphql'],
      /** the language parser for evaluating sources */
      language: 'typescript',
      /** Additional custom types evaluated as scalars */
      customScalarTypes: {
        URI: 'string',
        HTML: 'string',
        DateTime: 'string',
      },
      /** a config for persisted query generation */
      persist: {
        /** the file where the persisted query map is written */
        file: pathFromRoot('config/persisted_graphql_queries/github_ui.json'),
      },
    },
  },
}
