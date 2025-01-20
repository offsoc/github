import {getInitialState} from '../../../helpers/initial-state'
import {ViewerPrivileges} from '../../../helpers/viewer-privileges'
import {useEnabledFeatures} from '../../../hooks/use-enabled-features'
import {useProjectState} from '../../../state-providers/memex/use-project-state'

const BUSINESS = 'business' // team
const BUSINESS_PLUS = 'business_plus' // enterprise

const HISTORICAL_INSIGHTS_ENABLED_PLANS = [BUSINESS, BUSINESS_PLUS]

/**
 * A hook for dealing with insights specific flag logic
 */
export function useInsightsEnabledFeatures() {
  const {isDotcomRuntime, isBillingEnabled, projectOwner} = getInitialState()
  const {isPublicProject} = useProjectState()
  const {isOrganization, projectLimits} = getInitialState()
  const {
    memex_insights,
    memex_charts_basic_public,
    memex_charts_basic_private,
    memex_charts_basic_allow,
    memex_insights_basic_private,
    memex_insights_basic_public,
    memex_table_without_limits,
  } = useEnabledFeatures()
  const {hasWritePermissions} = ViewerPrivileges()

  // We will continue to honor the original memex_insights feature flag and
  // provide full charting features to orgs that that have been onboarded to the
  // Insights Platform. This feature is available to GHES/Proxima via the isBillingEnabled === false check
  // and for ALL team/enterprise plans
  const isInsightsEnabled: boolean =
    !memex_table_without_limits &&
    (isBillingEnabled === false ||
      (memex_insights && isOrganization && isDotcomRuntime) ||
      (isOrganization &&
        isDotcomRuntime &&
        !!projectOwner &&
        HISTORICAL_INSIGHTS_ENABLED_PLANS.includes(projectOwner.planName || '')))

  // Insights charts (current and historical) were designed with the assumption that all active items are loaded in the browser,
  // but that's not the case for Memex Without Limits.  Hence, disabling for now when memex_table_without_limits is enabled.
  const isInsightsChartViewEnabled = !memex_table_without_limits && hasWritePermissions

  // Typically, Free and legacy plans will have limits on saving charts.
  const hasUnlimitedSavedCharts =
    isInsightsEnabled || memex_charts_basic_allow || isPublicProject
      ? memex_charts_basic_public
      : memex_charts_basic_private

  const savedChartsLimit = hasUnlimitedSavedCharts ? Number.MAX_VALUE : projectLimits.limitedChartsLimit

  // Typically granted to Enterprise Cloud plans (aka business_plus).
  const isInsightsEligible = isPublicProject ? memex_insights_basic_public : memex_insights_basic_private

  return {
    /**
     * Whether the Insights platform for historical charts is enabled.
     */
    isInsightsEnabled,
    /**
     * Whether access to the insights view is enabled.
     */
    isInsightsChartViewEnabled,
    /**
     * Whether charts can be persisted or if there is a limit based on the memex owner's plan.
     */
    hasUnlimitedSavedCharts,
    /**
     * The maximum number of charts that can be saved, based on the memex owner's plan.
     */
    savedChartsLimit,
    /*
     * Whether Insights platform historical charts are considered a fully supported feature based on the memex owner's plan,
     * regardless of if Insights are enabled.
     */
    isInsightsEligible,
  }
}
