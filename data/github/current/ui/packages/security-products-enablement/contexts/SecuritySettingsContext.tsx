import type React from 'react'
import {createContext, useContext} from 'react'
import type {
  SecurityConfigurationSettings,
  SecurityProductAvailability,
  SecuritySettingOnChange,
  SettingFeatureFlags,
} from '../security-products-enablement-types'

interface ContextValue {
  handleSettingChange: SecuritySettingOnChange
  handleGhasSettingChange: SecuritySettingOnChange
  renderInlineValidation: (name: string) => React.ReactNode
  isAvailable: (availability: SecurityProductAvailability) => React.ReactNode
  featureFlags?: SettingFeatureFlags
}

export type SecuritySettingsContextValue = SecurityConfigurationSettings & ContextValue
export const SecuritySettingsContext = createContext<SecuritySettingsContextValue | undefined>(undefined)

export function useSecuritySettingsContext() {
  const context = useContext(SecuritySettingsContext)
  if (!context) {
    throw new Error('useSecuritySettingsContext must be used within a SecuritySettingsContext.Provider')
  }
  return context
}
