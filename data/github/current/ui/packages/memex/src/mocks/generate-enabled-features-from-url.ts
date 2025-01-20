import type {EnabledFeatures} from '../client/api/enabled-features/contracts'

/**
 * Re-exported to avoid the boundary issues from importing into playwright
 */
export type {EnabledFeatures}

/**
 * Default values for each feature flag
 * for the dev/test/staging environments
 */
export const defaultEnabledFeaturesConfig: Record<EnabledFeatures, boolean> = {
  memex_beta_with_dummy_feature: false,
  memex_charts_basic_allow: false,
  memex_charts_basic_public: true,
  memex_charts_basic_private: true,
  memex_insights_basic_public: true,
  memex_insights_basic_private: true,
  memex_insights: true,
  memex_chart_cards_insights: true,
  tasklist_block: true,
  memex_historical_charts_on_assignees_milestones: true,
  memex_group_by_multi_value_changes: false,
  tasklist_tracked_by_redesign: false,
  memex_paginated_archive: false,
  memex_resync_index: false,
  memex_automation_enabled: true,
  memex_table_without_limits: false,
  graphql_subscriptions: false,
  memex_disable_draft_issue_file_upload: false,
  memex_disable_autofocus: true,
  issue_types: true,
  issues_react_checklist_improvements: true,
  memex_status_updates_notifications: true,
  sub_issues: false,
  mwl_beta_optout: false,
  mwl_filter_bar_validation: false,
  memex_mwl_swimlanes: false,
  memex_mwl_server_group_order: false,
  memex_mwl_limited_field_ids: false,
  issues_react_create_new_label: true,
  projects_classic_sunset_ui: true,
  projects_classic_sunset_override: false,
}

/**
 * Using the default values for each feature flag
 * and the server feature overrides, generate a list of enabled features
 */
export function generateEnabledFeaturesFromURL(): Array<EnabledFeatures> {
  const featureOverrides = parseUrlServerFeatures()
  const featureSet = new Set<EnabledFeatures>()

  for (const [featureName, featureValue] of Object.entries(defaultEnabledFeaturesConfig) as Array<
    [EnabledFeatures, boolean]
  >) {
    /**
     * For every feature, if we have an override, use it
     */
    if (featureName in featureOverrides) {
      if (featureOverrides[featureName]) {
        featureSet.add(featureName)
      }
      /**
       * Otherwise, use the default value
       */
    } else if (featureValue) {
      featureSet.add(featureName)
    }
  }
  return [...featureSet]
}

/* Features for tests / dev can be enabled gradually and are set at build time or overridden via a feature flag*/

// Parse a list of features from a url param like: _memex_server_features=FEATURE_A:false,FEATURE_B:true
function parseUrlServerFeatures(): Partial<Record<EnabledFeatures, boolean>> {
  const result: Partial<Record<EnabledFeatures, boolean>> = {}
  if (!location) {
    return result
  }
  const params = new URLSearchParams(location.search)
  const parts = params.get('_memex_server_features')?.split(',')

  if (!parts || parts.length === 0) return result

  return parts.reduce((obj, featureAndValue) => {
    const [featureName, featureValue] = featureAndValue.split(':') as [EnabledFeatures, string]
    obj[featureName] = featureValue.toLowerCase() === 'true'
    return obj
  }, result)
}
