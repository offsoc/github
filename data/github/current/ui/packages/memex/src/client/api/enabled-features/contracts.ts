/**
 * FEATURE FLAGS (aka "Flippers")
 * =================
 * These are flagged-in features that we control.
 * To manage these features, go to: https://admin.github.com/devtools/feature_flags
 */
const featureFlags = [
  // This method demonstrates usage of this service, but it isn't a real feature.
  'memex_beta_with_dummy_feature',

  // Enables access to the Insights tab/view from the navigation buttons,
  // and enables historical Insights 'time' charts
  'memex_insights',

  // Feature flag override to provide memex_charts_basic_public/private gated features
  // typically reserved for paid plans.
  'memex_charts_basic_allow',

  // Feature flag to toggle the ChartCard on the insights memex page
  'memex_chart_cards_insights',

  // Whether to show the Group by assignees, milestones for historical charts
  'memex_historical_charts_on_assignees_milestones',

  // Tasks list block gate the tracks column and all things related to hierarchy
  'tasklist_block',

  // Enable "group by distinct" for multi-value fields like assignees
  'memex_group_by_multi_value_changes',

  // Enables the redesigned tracked by pills and hovercards
  'tasklist_tracked_by_redesign',

  // Enables a paginated archive view to support a 48K archive limit
  // The memex_table_without_limits feature flag will also enable the paginated archive view
  'memex_paginated_archive',

  // Enables the resync index button for project admins for reindexing Elasticsearch for Memex Without limits
  'memex_resync_index',

  // Controls whether automations are enabled or not, this is not a real FF, it delegates to enterprise business config
  'memex_automation_enabled',

  // Enable Table View Without Limits (Elasticsearch powered backend)
  'memex_table_without_limits',

  // Disable file upload in the side-panel for draft issues
  'memex_disable_draft_issue_file_upload',

  // Live update of GraphQL queries used in the issue viewer
  'graphql_subscriptions',

  // Disable autofocusing first item in project views
  'memex_disable_autofocus',

  // Enable the issue_types picker in the issue create dialog
  'issue_types',

  // Enable drag & drop features for task lists
  'issues_react_checklist_improvements',

  // Enable project status updates
  'memex_status_updates_notifications',

  // Display the sub-issues list and button group
  'sub_issues',

  // Enable the beta optout controls
  'mwl_beta_optout',

  // Enable display of validation messages for filter bar in mwl
  'mwl_filter_bar_validation',

  // Enable board view swimlanes for Projects Without Limits
  'memex_mwl_swimlanes',

  // Respect server-side vertical group order
  'memex_mwl_server_group_order',

  // Only include requested field ids in paginated items responses
  'memex_mwl_limited_field_ids',

  // Allow users to create new label in the repo if the label is not found in the picker
  'issues_react_create_new_label',

  // disables the projects classic UI
  'projects_classic_sunset_ui',

  // ensures that the projects classic UI is enabled
  'projects_classic_sunset_override',
] as const

type FeatureFlags = (typeof featureFlags)[number]

/**
 * FEATURE PREVIEWS
 * =================
 * These are opt-in features available to users.
 * To manage these features, go to: https://admin.github.com/devtools/toggleable_features
 */
const featurePreviews = [] as const

type FeaturePreviews = (typeof featurePreviews)[number]

/**
 * FEATURE GATES
 * =================
 * These are features gated by the billing plan of the memex owner org/user.
 * Feature gates are specified in plans.yaml files, as described here:
 * https://github.com/github/githubber-content/blob/691749f4be532371dbb7aa65a8b2440e68f6e673/docs/technology/dotcom/plan-feature-gates.md
 */
const featureGates = [
  // Enables basic features for creating/saving custom, current state charts in the project insights view for public projects
  'memex_charts_basic_public',
  // Enables basic features for creating/saving custom, current state charts in the project insights view for private projects
  'memex_charts_basic_private',
  // Enables basic features for viewing/creating/saving historical Insights charts in the project insights view for public projects
  'memex_insights_basic_public',
  // Enables basic features for viewing/creating/saving historical Insights charts in the project insights view for private projects
  'memex_insights_basic_private',
] as const

type FeatureGates = (typeof featureGates)[number]

/**
 * ENABLED FEATURES
 * =================
 * Projects don't need to know where a feature is enabled from, only the state.
 * Given that, we merge all feature flags, previews, and gates into a single array.
 */
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
export type EnabledFeatures = FeaturePreviews | FeatureFlags | FeatureGates
export const enabledFeatures = [...featurePreviews, ...featureFlags, ...featureGates]

export type EnabledFeaturesMap = {[P in EnabledFeatures]: boolean}

export const allFeaturesDisabled = enabledFeatures.reduce((map, current) => {
  map[current] = false
  return map
}, {} as EnabledFeaturesMap)
