import {useNavigate, useSearchParams} from '@github-ui/use-navigate'
import type React from 'react'
import {createContext, useCallback, useContext, useMemo, useState} from 'react'

import {useUpdateUserSplitPreference} from '../hooks/use-update-user-split-preference'
import type {DiffViewSettings, SplitPreference} from '../types/commit-types'

const defaultViewSettings: DiffViewSettingsContextProps = {
  hideWhitespace: false,
  splitPreference: 'split',
  updateHideWhitespace: () => {},
  updateSplitPreference: () => {},
}

type DiffViewSettingsContextProps = {
  updateHideWhitespace: (newPreference: boolean) => void
  updateSplitPreference: (newPreference: SplitPreference) => void
} & DiffViewSettings

const DiffViewSettingsContext = createContext<DiffViewSettingsContextProps>(defaultViewSettings)

export function DiffViewSettingsProvider({
  viewSettings,
  children,
}: React.PropsWithChildren<{viewSettings: DiffViewSettings}>) {
  const navigate = useNavigate()

  // user + query params preferences
  const userSplitPreference = useSplitViewPreference(viewSettings.splitPreference)
  const userWhitespaceParam = useWhitespacePreference(viewSettings.hideWhitespace)

  // context state variables
  const [splitPreference, setSplitPreference] = useState(userSplitPreference)
  const [hideWhitespace, setHideWhitespace] = useState(userWhitespaceParam)

  // update user preferences
  const updateUserSplitPreference = useUpdateUserSplitPreference()

  const updateSplitPreference = useCallback(
    (newPreference: SplitPreference) => {
      updateQueryParam('diff', newPreference)
      setSplitPreference(newPreference)
      updateUserSplitPreference(newPreference)
    },
    [updateUserSplitPreference],
  )

  const updateHideWhitespace = useCallback(
    (newPreference: boolean) => {
      setHideWhitespace(newPreference)
      navigate(`${window.location.pathname}?w=${newPreference ? '1' : '0'}`)
    },
    [navigate],
  )

  const diffViewSettings = useMemo(
    () => ({
      hideWhitespace,
      splitPreference,
      updateHideWhitespace,
      updateSplitPreference,
    }),
    [hideWhitespace, splitPreference, updateHideWhitespace, updateSplitPreference],
  )

  return <DiffViewSettingsContext.Provider value={diffViewSettings}>{children}</DiffViewSettingsContext.Provider>
}

export function useDiffViewSettings() {
  return useContext(DiffViewSettingsContext)
}

function useSplitViewPreference(defaultPreference: SplitPreference): SplitPreference {
  let splitPreference = defaultPreference

  const [searchParams] = useSearchParams()
  const splitPreferenceParam = searchParams.get('diff')

  if (splitPreferenceParam === 'split' || splitPreferenceParam === 'unified') {
    splitPreference = splitPreferenceParam
  }

  return splitPreference
}

function useWhitespacePreference(defaultPreference: boolean): boolean {
  let hideWhitespace = defaultPreference

  const [searchParams] = useSearchParams()
  const whitespaceParam = searchParams.get('w')

  if (whitespaceParam === '1') {
    hideWhitespace = true
  } else if (whitespaceParam === '0') {
    hideWhitespace = false
  }

  return hideWhitespace
}

function updateQueryParam(paramName: string, value: string) {
  const url = new URL(window.location.href, window.location.origin)

  if (value) {
    const encodedValue = encodeURIComponent(value)
    url.searchParams.set(paramName, encodedValue)
  } else {
    url.searchParams.delete(paramName)
  }
  window.history.replaceState({path: url.toString()}, '', url.toString())
}
