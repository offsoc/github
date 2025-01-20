import {ActionList, ActionMenu, useTheme} from '@primer/react'

import {navItemOverlaySx} from './styles'

export const ThemePicker = ({opts}: {opts: Array<string>}) => {
  const {resolvedColorScheme} = useTheme()
  return (
    <ActionMenu>
      <ActionMenu.Button size="small">🎨</ActionMenu.Button>
      <ActionMenu.Overlay sx={navItemOverlaySx}>
        <ActionList selectionVariant="single">
          {opts.map(opt => {
            return (
              <ActionList.Item
                onSelect={() => {
                  /**
                   * Override the document theme dataset attributes with the new values
                   * we only use auto, and override both light and dark to avoid needing
                   * to know which one is currently active
                   */
                  document.documentElement.setAttribute('data-color-mode', 'auto')
                  document.documentElement.setAttribute('data-light-theme', opt)
                  document.documentElement.setAttribute('data-dark-theme', opt)
                }}
                selected={opt === resolvedColorScheme}
                key={opt}
              >
                {opt}
              </ActionList.Item>
            )
          })}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
