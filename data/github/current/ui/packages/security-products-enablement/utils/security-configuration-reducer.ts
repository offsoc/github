import {
  SettingValue,
  type SecurityConfigurationSettings,
  type SecuritySettingOptions,
  type SecuritySettings,
  type SettingOptions,
} from '../security-products-enablement-types'

type SecurityConfigurationSettingsAction =
  | 'ENABLE_GHAS'
  | 'DISABLE_GHAS'
  | 'ENABLE_GHAS_SETTINGS'
  | 'DISABLE_GHAS_SETTINGS'
  | 'UPDATE_SECURITY_SETTINGS'

const SecuritySettingsMap: {
  [key in keyof SecuritySettings]: {
    parents: Array<keyof SecuritySettings>
    children: Array<keyof SecuritySettings>
  }
} = {
  dependencyGraph: {
    parents: [],
    children: [
      'dependabotAlerts',
      'dependabotAlertsVEA',
      'dependabotSecurityUpdates',
      'dependencyGraphAutosubmitAction',
    ],
  },
  dependencyGraphAutosubmitAction: {
    parents: ['dependencyGraph'],
    children: [],
  },
  dependabotAlerts: {
    parents: ['dependencyGraph'],
    children: ['dependabotAlertsVEA', 'dependabotSecurityUpdates'],
  },
  dependabotAlertsVEA: {parents: ['dependabotAlerts', 'dependencyGraph'], children: []},
  dependabotSecurityUpdates: {parents: ['dependabotAlerts', 'dependencyGraph'], children: []},
  codeScanning: {parents: [], children: []},
  secretScanning: {
    parents: [],
    children: ['secretScanningPushProtection', 'secretScanningValidityChecks', 'secretScanningNonProviderPatterns'],
  },
  secretScanningPushProtection: {parents: ['secretScanning'], children: []},
  secretScanningValidityChecks: {parents: ['secretScanning'], children: []},
  secretScanningNonProviderPatterns: {parents: ['secretScanning'], children: []},
  privateVulnerabilityReporting: {parents: [], children: []},
}

/**
 * This function updates a security setting and its children/parents based on the new value.
 * See issue for all the possible state changes:
 *  https://github.com/github/security-products-growth/issues/95#issuecomment-1823238104
 */
function updateSecurityConfigurationSettings(
  feature: keyof SecuritySettings,
  updatedValue: SettingValue,
  updatedOptions: SettingOptions,
  oldSettings: SecurityConfigurationSettings,
): SecurityConfigurationSettings {
  const isChildFeature = SecuritySettingsMap[feature].parents.length > 0
  const isParentFeature = SecuritySettingsMap[feature].children.length > 0
  const newSettings = {...oldSettings, [feature]: updatedValue}

  // If there is an options value for this feature we should check if
  // there is a corresponding SecuritySettingOptions property for the
  // feature.
  let featureOptions
  if (updatedOptions) {
    if (`${feature}Options` in oldSettings) {
      featureOptions = `${feature}Options` as keyof SecuritySettingOptions
      newSettings[featureOptions] = updatedOptions
      // If a parent feature is disabled any child features will retain their options
      // even if they become Disabled or NotSet - this is working as intended.
      //
      //
      // Consider that in an option may be a user-entered string, deleting it from the
      // SecurityConfiguration due to a cascaded disablement click isn't desirable.
      //
      // The feature being disabled takes precedent so the options will never be
      // applied since the feature is either disabled or not specified by the
      // SecurityConfiguration, but they will be retained for ease of use in future.
    }
  }

  if (isChildFeature) {
    for (const parentFeature of SecuritySettingsMap[feature].parents) {
      if (oldSettings[parentFeature] === SettingValue.Disabled) {
        newSettings[parentFeature] = updatedValue
      } else if (oldSettings[parentFeature] === SettingValue.NotSet) {
        if (updatedValue === SettingValue.Enabled) newSettings[parentFeature] = updatedValue
        else if (updatedValue === SettingValue.Disabled) newSettings[parentFeature] = SettingValue.NotSet
      }
    }
  }

  if (isParentFeature) {
    for (const childFeature of SecuritySettingsMap[feature].children) {
      if (oldSettings[childFeature] === SettingValue.Enabled) {
        // if the child feature was previously enabled, update the child setting to the parent's new value (either Not Set or Disabled)
        newSettings[childFeature] = updatedValue
        // if the child feature was previously Not Set
      } else if (oldSettings[childFeature] === SettingValue.NotSet) {
        // VEA should mirror Dependabot Alerts' state
        if (childFeature === 'dependabotAlertsVEA') {
          newSettings[childFeature] = newSettings[feature]

          // if Enabled -> NotSet or NotSet -> Enabled, leave at NotSet
        } else if (
          (oldSettings[feature] === SettingValue.Enabled && updatedValue === SettingValue.NotSet) ||
          (oldSettings[feature] === SettingValue.NotSet && updatedValue === SettingValue.Enabled)
        ) {
          newSettings[childFeature] = SettingValue.NotSet

          // if Enabled -> Disabled or NotSet -> Disabled, set to Disabled
        } else if (
          (oldSettings[feature] === SettingValue.Enabled && updatedValue === SettingValue.Disabled) ||
          (oldSettings[feature] === SettingValue.NotSet && updatedValue === SettingValue.Disabled)
        ) {
          newSettings[childFeature] = SettingValue.Disabled
        }
      }
    }
  }

  // handle VEA
  if (newSettings['enableGHAS'] && feature === 'dependabotAlerts') {
    switch (updatedValue) {
      case SettingValue.Enabled:
        newSettings['dependabotAlertsVEA'] = SettingValue.Enabled
        break
      case SettingValue.NotSet:
        newSettings['dependabotAlertsVEA'] = SettingValue.NotSet
        break
    }
  }

  return newSettings
}

function ghasSettings(enable: boolean): Partial<SecurityConfigurationSettings> {
  const settings: Partial<SecurityConfigurationSettings> = {
    dependabotAlertsVEA: enable ? SettingValue.Enabled : SettingValue.Disabled,
    codeScanning: enable ? SettingValue.Enabled : SettingValue.Disabled,
    secretScanning: enable ? SettingValue.Enabled : SettingValue.Disabled,
    secretScanningValidityChecks: enable ? SettingValue.Enabled : SettingValue.Disabled,
    secretScanningPushProtection: enable ? SettingValue.Enabled : SettingValue.Disabled,
    secretScanningNonProviderPatterns: enable ? SettingValue.Enabled : SettingValue.Disabled,
  }

  if (enable) return {...settings, dependabotAlerts: SettingValue.Enabled, dependencyGraph: SettingValue.Enabled}

  return settings
}

export const securityConfigurationSettingsReducer = (
  state: SecurityConfigurationSettings,
  action: {
    type: SecurityConfigurationSettingsAction
    state?: {setting?: keyof SecuritySettings; value?: SettingValue; options?: SettingOptions}
  },
) => {
  switch (action.type) {
    case 'ENABLE_GHAS':
      return enableVEAIfRequired({...state, enableGHAS: true})
    case 'DISABLE_GHAS':
      return {...state, enableGHAS: false}
    case 'ENABLE_GHAS_SETTINGS':
      return {...state, ...ghasSettings(true)}
    case 'DISABLE_GHAS_SETTINGS':
      return {...state, ...ghasSettings(false)}
    case 'UPDATE_SECURITY_SETTINGS':
      return {
        ...updateSecurityConfigurationSettings(
          action.state!.setting!,
          action.state!.value!,
          action.state!.options!,
          state,
        ),
      }
    default:
      return {...state}
  }
}

// VEA must be enabled if Dependabot Alerts is enabled
const enableVEAIfRequired = (state: SecurityConfigurationSettings): SecurityConfigurationSettings => {
  if (state.dependabotAlerts === SettingValue.Enabled && state.dependabotAlertsVEA === SettingValue.Disabled) {
    state.dependabotAlertsVEA = SettingValue.Enabled
  }
  return state
}
