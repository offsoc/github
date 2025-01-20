import {type FilePagePayload, isTreePayload, type PanelType} from '@github-ui/code-view-types'
import {useCurrentUser} from '@github-ui/current-user'
import safeStorage from '@github-ui/safe-storage'
import {ScreenSize, useScreenSize} from '@github-ui/screen-size'
import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'

const safeLocalStorage = safeStorage('localStorage')

export type SetPanelOpenType = (panelType: PanelType | undefined, returnFocusTarget?: HTMLElement | null) => void

type OpenPanelContextType = {
  openPanel: PanelType | undefined
  setOpenPanel: SetPanelOpenType
}

const OpenPanelContext = createContext<OpenPanelContextType>({openPanel: undefined, setOpenPanel: () => undefined})

/**
 * This is equivalent to a simple setState, except we will not show the
 * state as 'codeNav' or allow it to be set to 'codeNav' when on the blame page.
 * This also adds a listener to hide the panel on smaller viewports
 */
export function OpenPanelProvider({
  children,
  payload,
  openPanelRef,
}: {
  children: React.ReactNode
  payload: FilePagePayload
  openPanelRef: React.MutableRefObject<string | undefined>
}) {
  const hasBlame = 'blame' in payload
  const isTreeView = isTreePayload(payload)
  const currentUser = useCurrentUser()

  const returnFocusTargetRef = useRef<HTMLElement | null | undefined>()
  const [rawOpenPanel, setRawOpenPanel] = useState<PanelType | undefined>(() => {
    const storedSetting = safeLocalStorage.getItem('codeNavOpen')
    //only use the cookie if the user isn't logged in
    if (!currentUser && storedSetting !== '' && storedSetting !== null) {
      return 'codeNav'
    }
    if (currentUser && payload.symbolsExpanded) {
      return 'codeNav'
    }
  })

  const openPanel = (hasBlame || isTreeView) && rawOpenPanel === 'codeNav' ? undefined : rawOpenPanel

  React.useEffect(() => {
    openPanelRef.current = openPanel
  }, [openPanel, openPanelRef])

  const setOpenPanel = useCallback(
    (panelType: PanelType | undefined, returnFocusTarget?: HTMLElement | null) => {
      setRawOpenPanel(currentPanel => {
        if (currentPanel && returnFocusTargetRef.current) {
          returnFocusTargetRef.current.focus()
        }
        returnFocusTargetRef.current = returnFocusTarget
        return hasBlame || (isTreeView && panelType === 'codeNav') ? undefined : panelType
      })
    },
    [hasBlame, isTreeView],
  )

  useHandlePanelScreenResize(setOpenPanel)

  const contextValue: OpenPanelContextType = useMemo(() => {
    return {
      openPanel,
      setOpenPanel,
    }
  }, [openPanel, setOpenPanel])

  return <OpenPanelContext.Provider value={contextValue}>{children}</OpenPanelContext.Provider>
}

// This should be SSR safe since it won't run on the server
function useHandlePanelScreenResize(setOpenPanel: (panel: PanelType | undefined) => void) {
  const {screenSize} = useScreenSize()
  const previousScreenSize = useRef(screenSize)

  useEffect(() => {
    // hide the panel if our previous render was on large screen size and the current size is smaller
    // (this prevents the panel from hiding when resizing between small/medium screen sizes)
    // or if the screenSize is a small viewport on our initial load
    const isChangingToSmallViewport = previousScreenSize.current >= ScreenSize.large
    const isInitialLoad = previousScreenSize.current === screenSize

    if (screenSize < ScreenSize.large && (isChangingToSmallViewport || isInitialLoad)) {
      setOpenPanel(undefined)
    }

    previousScreenSize.current = screenSize
  }, [screenSize, setOpenPanel])
}

export function useOpenPanel() {
  return useContext(OpenPanelContext)
}
