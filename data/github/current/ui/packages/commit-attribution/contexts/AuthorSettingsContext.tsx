import {merge} from '@primer/react'
import type React from 'react'
import {createContext, useContext} from 'react'

export type AuthorSettings = {
  fontWeight: 'normal' | 'semibold' | 'bold'
  fontColor: 'fg.default' | 'fg.muted'
  includeTooltip: boolean
  avatarSize: 16 | 20 | undefined
}

const defaultSettings: AuthorSettings = {
  fontWeight: 'bold' as const,
  fontColor: 'fg.default' as const,
  includeTooltip: false,
  avatarSize: undefined, // defaults to primer component default
}

const AuthorSettingsContext = createContext<AuthorSettings>(defaultSettings)

export function AuthorSettingsProvider({
  authorSettings,
  children,
}: React.PropsWithChildren<{authorSettings: Partial<AuthorSettings> | undefined}>) {
  const authorSettingsOrDefault = merge(defaultSettings, authorSettings ?? {})
  return <AuthorSettingsContext.Provider value={authorSettingsOrDefault}>{children}</AuthorSettingsContext.Provider>
}

export function useAuthorSettings() {
  return useContext(AuthorSettingsContext) || defaultSettings
}
