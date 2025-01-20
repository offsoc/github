import {createContext, memo, useContext, useMemo, useState} from 'react'

type CustomFieldsSettingsContext = {
  currentColumnTitle: string
  setCurrentColumnTitle: (currentColumnTitle: string) => void
}

const CustomFieldsSettingsContext = createContext<CustomFieldsSettingsContext | null>(null)
/**
 * This hooks exposes a read-only details of the current field being viewed by the user
 * on the settings page.
 */
export const useCustomFieldsSettings = (): CustomFieldsSettingsContext => {
  const contextValue = useContext(CustomFieldsSettingsContext)

  if (!contextValue) {
    throw new Error('useCustomFieldsSettings must be used within a SettingsContext.Provider')
  }

  return contextValue
}

export const CustomFieldSettingsProvider = memo<{children?: React.ReactNode}>(function SettingsProvider({children}) {
  const [currentColumnTitle, setCurrentColumnTitle] = useState('')

  return (
    <CustomFieldsSettingsContext.Provider
      value={useMemo(() => {
        return {currentColumnTitle, setCurrentColumnTitle}
      }, [currentColumnTitle])}
    >
      {children}
    </CustomFieldsSettingsContext.Provider>
  )
})
