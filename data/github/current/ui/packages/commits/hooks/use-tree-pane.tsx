// eslint-disable-next-line filenames/match-regex
import {useCurrentUser} from '@github-ui/current-user'
import {getCurrentSize, ScreenSize} from '@github-ui/screen-size'
import {useClientValue} from '@github-ui/use-client-value'
import type {SplitPageLayoutContentProps, SplitPageLayoutPaneProps} from '@primer/react'
import {useCallback, useMemo, useRef, useState} from 'react'

import {ExpandButton} from '../components/Commit/ExpandButton'
import {useUpdateUserTreePreference} from './use-update-user-tree-preference'

type ExpandTreeFunction = () => void
type CollapseTreeFunction = () => void

interface TreePane {
  splitPagePaneHiddenSx: SplitPageLayoutPaneProps['sx']
  splitPageContentHidden: SplitPageLayoutContentProps['hidden']
  treeToggleElement: JSX.Element
  treeToggleRef: React.RefObject<HTMLButtonElement>
  expandTree: ExpandTreeFunction
  collapseTree: CollapseTreeFunction
}

export function useTreePane(fileTreeId: string, userPrefTreeExpanded: boolean): TreePane {
  const updateExpandPreferences = useUpdateUserTreePreference()
  const [isSSR] = useClientValue(() => false, true, [])
  const currentUser = useCurrentUser()

  const treeToggleRef = useRef<HTMLButtonElement>(null)
  const mobileTreeToggleRef = useRef<HTMLButtonElement>(null)

  const [isTreeExpanded, setIsTreeExpanded] = useState(userPrefTreeExpanded)
  const [isMobileTreeExpanded, setIsMobileTreeExpanded] = useState(false)

  const expandTree: ExpandTreeFunction = useCallback(() => {
    // we can do this since we're now on the client when this occurs
    const currentSize = getCurrentSize(window.innerWidth)

    if (currentSize <= ScreenSize.medium) {
      setIsMobileTreeExpanded(true)
      requestAnimationFrame(() => mobileTreeToggleRef.current?.focus())
    } else {
      setIsTreeExpanded(true)
      updateExpandPreferences(true, currentUser)
      requestAnimationFrame(() => treeToggleRef.current?.focus())
    }
  }, [currentUser, updateExpandPreferences])

  const collapseTree: CollapseTreeFunction = useCallback(() => {
    // we can do this since we're now on the client when this occurs
    const currentSize = getCurrentSize(window.innerWidth)

    if (currentSize <= ScreenSize.medium) {
      setIsMobileTreeExpanded(false)
      requestAnimationFrame(() => mobileTreeToggleRef.current?.focus())
    } else {
      setIsTreeExpanded(false)
      updateExpandPreferences(false, currentUser)
      requestAnimationFrame(() => treeToggleRef.current?.focus())
    }
  }, [currentUser, updateExpandPreferences])

  const regularTreeToggleElement = useMemo(
    () => (
      <ExpandButton
        expanded={isTreeExpanded}
        alignment="left"
        ariaLabel={isTreeExpanded ? 'Collapse file tree' : 'Expand file tree'}
        tooltipDirection="se"
        testid="file-tree-button"
        ariaControls={fileTreeId}
        ref={treeToggleRef}
        onToggleExpanded={() => {
          isTreeExpanded ? collapseTree() : expandTree()
        }}
        className="d-none d-md-flex position-relative"
      />
    ),
    [isTreeExpanded, fileTreeId, collapseTree, expandTree],
  )

  const mobileTreeToggleElement = useMemo(
    () => (
      <ExpandButton
        expanded={isMobileTreeExpanded}
        alignment="left"
        ariaLabel={isMobileTreeExpanded ? 'Collapse file tree' : 'Expand file tree'}
        tooltipDirection="se"
        testid="file-tree-button"
        ariaControls={fileTreeId}
        ref={mobileTreeToggleRef}
        onToggleExpanded={() => {
          isMobileTreeExpanded ? collapseTree() : expandTree()
        }}
        className="d-md-none position-relative"
      />
    ),
    [isMobileTreeExpanded, fileTreeId, collapseTree, expandTree],
  )

  const treeToggleElement = useMemo(
    () => (
      <>
        {mobileTreeToggleElement}
        {regularTreeToggleElement}
      </>
    ),
    [mobileTreeToggleElement, regularTreeToggleElement],
  )

  let splitPagePaneHiddenSx: TreePane['splitPagePaneHiddenSx'] = {}

  // this SX hackery instead of using panel["hidden"] brought to you by SSR
  if (isSSR && !userPrefTreeExpanded) {
    splitPagePaneHiddenSx = {display: 'none'}
  } else {
    splitPagePaneHiddenSx = {
      flexDirection: ['column', 'column', 'inherit'],
      '@media screen and (max-width: 768px)': !isMobileTreeExpanded ? {display: 'none'} : {mt: -3},
      '@media screen and (min-width: 769px)': isTreeExpanded
        ? {
            height: '100vh',
            maxHeight: '100vh !important',
          }
        : {display: 'none'},
    }
  }

  return {
    splitPagePaneHiddenSx,
    splitPageContentHidden: {narrow: isMobileTreeExpanded, regular: false},
    expandTree,
    collapseTree,
    treeToggleElement,
    treeToggleRef,
  }
}
