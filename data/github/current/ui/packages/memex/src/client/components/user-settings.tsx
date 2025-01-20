import safeStorage from '@github-ui/safe-storage'
import {createContext, type ReactNode, useCallback, useContext, useMemo, useReducer} from 'react'
import invariant from 'tiny-invariant'

import {UserSettingsEdit} from '../api/stats/contracts'
import {usePostStats} from '../hooks/common/use-post-stats'

const safeLocalStorage = safeStorage('localStorage')

/**
 * Represents a user setting, which is stored locally and not persisted
 * to the server, and only applies to each user specifically.
 */
export type UserSetting = {
  name: string
  enabled: boolean
  toggleEnabled: () => void
  label: string
}

/** Record of all supported user settings */
type UserSettingsContextValue = {
  roadmapTruncateTitles: UserSetting
  roadmapShowDateFields: UserSetting
}
const UserSettingsContext = createContext<UserSettingsContextValue | null>(null)

// Type representing all names of user settings
type UserSettingKey = keyof UserSettingsContextValue

const userSettingsLabels: Record<UserSettingKey, string> = {
  roadmapTruncateTitles: 'Truncate titles',
  roadmapShowDateFields: 'Show date fields',
}

/**
 * Gets a user setting from local storage, or provides a default value if one is not stored yet.
 * Returns the user setting, and a callback to mutate its value in React and local storage simultaneously.
 */
function useUserSetting(name: UserSettingKey, defaultValue: boolean, overrideValue?: boolean): UserSetting {
  const localStorageValue = safeLocalStorage.getItem(`projects.${name}`)
  const [enabled, dispatch] = useReducer(userSettingReducer, defaultValue, () => {
    return overrideValue !== undefined ? overrideValue : localStorageValue ? localStorageValue === 'true' : defaultValue
  })
  const {postStats} = usePostStats()
  const toggleEnabled = useCallback(() => {
    dispatch({type: 'toggle', name})
    postStats({
      name: UserSettingsEdit,
      // The enabled value should be the opposite of what it currently is, since we're toggling
      context: JSON.stringify({name, enabled: !enabled}),
    })
  }, [enabled, name, postStats])
  const label = userSettingsLabels[name]

  const setting: UserSetting = useMemo(
    () => ({name, enabled, toggleEnabled, label}),
    [name, enabled, toggleEnabled, label],
  )

  return setting
}

type UserSettingAction = {type: 'toggle'; name: UserSettingKey}

function userSettingReducer(state: boolean, action: UserSettingAction): boolean {
  switch (action.type) {
    case 'toggle': {
      safeLocalStorage.setItem(`projects.${action.name}`, String(!state))
      return !state
    }
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
}

export function UserSettingsProvider({children}: {children: ReactNode}) {
  const roadmapTruncateTitles = useUserSetting('roadmapTruncateTitles', false)
  const roadmapShowDateFields = useUserSetting('roadmapShowDateFields', false)

  return (
    <UserSettingsContext.Provider
      value={useMemo(
        () => ({
          roadmapTruncateTitles,
          roadmapShowDateFields,
        }),
        [roadmapShowDateFields, roadmapTruncateTitles],
      )}
    >
      {children}
    </UserSettingsContext.Provider>
  )
}

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext)
  invariant(context !== null, 'useUserSettings must be used within a UserSettingsProvider')
  return context
}
