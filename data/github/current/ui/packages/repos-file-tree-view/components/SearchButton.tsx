import {appendAndFocusSearchBar} from '@github-ui/append-and-focus-search-bar'
import {DuplicateOnKeydownButton} from '@github-ui/code-view-shared/components/DuplicateOnKeydownButton'
import {useShortcut} from '@github-ui/code-view-shared/hooks/shortcuts'
import {SearchIcon} from '@primer/octicons-react'
import {IconButton} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import type React from 'react'

export default function SearchButton({
  sx,
  onClick,
  textAreaId,
}: {
  sx?: BetterSystemStyleObject
  onClick?: () => void
  textAreaId: string
}) {
  const {searchShortcut} = useShortcut()
  return (
    <>
      {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
      <IconButton
        unsafeDisableTooltip={true}
        aria-label="Search this repository"
        icon={SearchIcon}
        data-hotkey={searchShortcut.hotkey}
        sx={{color: 'fg.subtle', fontSize: 14, fontWeight: 'normal', flexShrink: 0, ...sx}}
        size="medium"
        onClick={(e: React.MouseEvent) => {
          onClick?.()
          appendAndFocusSearchBar({
            retainScrollPosition: true,
            returnTarget: (e.target as HTMLElement).closest('button') as HTMLElement,
          })
        }}
      />

      <DuplicateOnKeydownButton
        buttonFocusId={textAreaId}
        buttonHotkey={searchShortcut.hotkey}
        onButtonClick={() => {
          const textArea = document.getElementById(textAreaId)
          onClick?.()
          appendAndFocusSearchBar({
            retainScrollPosition: true,
            returnTarget: textArea ?? undefined,
          })
        }}
        onlyAddHotkeyScopeButton={true}
      />
    </>
  )
}
