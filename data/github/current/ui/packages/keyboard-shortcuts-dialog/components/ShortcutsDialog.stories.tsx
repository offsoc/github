import type {Meta, StoryFn} from '@storybook/react'
import {ShortcutsDialog} from './ShortcutsDialog'
import {useState} from 'react'
import {HttpResponse, http} from '@github-ui/storybook/msw'
import strings from '../strings'

interface Args {
  loading: boolean
}

export default {
  title: 'KeyboardShortcutsDialog/ShortcutsDialog',
  argTypes: {
    loading: {
      control: 'boolean',
      defaultValue: false,
    },
  },
  parameters: {
    msw: {
      handlers: [
        // Keyboard Shortcuts
        http.get(`/site/keyboard_shortcuts`, () => {
          return HttpResponse.json({
            commands: {
              global: {
                service: {
                  id: 'global',
                  name: strings.siteWideShortcuts,
                },
                commands: [
                  {
                    id: 'open-command-palette',
                    name: 'Open command palette',
                    description: 'Open the command palette',
                    keybinding: ['Mod+k', 'Mod+Alt+k'],
                  },
                  {
                    id: 'open-command-palette-in-command-mode',
                    name: 'Open command palette in command mode',
                    description: 'Open the command palette in command mode',
                    keybinding: 'Mod+Shift+k',
                  },
                  {
                    id: 'open-search-bar',
                    name: 'Open search bar',
                    description: 'Open the search bar',
                    keybinding: ['s', '/'],
                  },
                  {
                    id: 'go-to-notifications',
                    name: 'Go to notifications',
                    description: 'Go to notifications',
                    keybinding: 'g n',
                  },
                  {
                    id: 'go-to-dashboard',
                    name: 'Go to dashboard',
                    description: 'Go to dashboard',
                    keybinding: 'g d',
                  },
                  {
                    id: 'go-to-issues',
                    name: 'Go to your issues',
                    description: 'Go to your issues',
                    keybinding: 'g i',
                  },
                  {
                    id: 'go-to-pull-requests',
                    name: 'Go to your pull requests',
                    description: 'Go to your pull requests',
                    keybinding: 'g p',
                  },
                  {
                    id: 'help-dialog',
                    name: 'Bring up this help dialog',
                    description: 'Bring up this help dialog',
                    keybinding: 'Shift+?',
                  },
                  {
                    id: 'move-selection-down',
                    name: 'Move selection down',
                    description: 'Move selection down',
                    keybinding: 'j',
                  },
                  {
                    id: 'move-selection-up',
                    name: 'Move selection up',
                    description: 'Move selection up',
                    keybinding: 'k',
                  },
                  {
                    id: 'toggle-selection',
                    name: 'Toggle selection',
                    description: 'Toggle selection',
                    keybinding: 'x',
                  },
                  {
                    id: 'open-selection',
                    name: 'Open selection',
                    description: 'Open selection',
                    keybinding: ['o', 'Enter'],
                  },
                ],
              },
              'navigating-project': {
                service: {id: 'navigating-project', name: 'Navigating a Project'},
                commands: [
                  {
                    id: 'open-command-palette',
                    name: 'Open command palette',
                    description: 'Open the command palette',
                    keybinding: 'Mod+k',
                  },
                  {
                    id: 'focus-filter-field',
                    name: 'Focus filter field',
                    description: 'Focus the filter field',
                    keybinding: 'Mod+/',
                  },
                  {
                    id: 'move-cell-focus-to-the-left',
                    name: 'Move cell focus to the left',
                    description: 'Move cell focus to the left',
                    keybinding: 'ArrowLeft Shift+Tab',
                  },
                  {
                    id: 'move-cell-focus-to-the-right',
                    name: 'Move cell focus to the right',
                    description: 'Move cell focus to the right',
                    keybinding: ['ArrowRight', 'Tab'],
                  },
                  {
                    id: 'move-cell-focus-up',
                    name: 'Move cell focus up',
                    description: 'Move cell focus up',
                    keybinding: 'ArrowUp',
                  },
                  {
                    id: 'move-cell-focus-down',
                    name: 'Move cell focus down',
                    description: 'Move cell focus down',
                    keybinding: 'ArrowDown',
                  },
                  {
                    id: 'move-focus-to-from-side-panel',
                    name: 'Move focus to/from side panel',
                    description: 'Move focus to/from side panel',
                    keybinding: 'Mod+F6',
                  },
                ],
              },
              'manipulating-project': {
                service: {id: 'manipulating-project', name: 'Manipulating a Project'},
                commands: [
                  {
                    id: 'toggle-edit-mode-for-the-focused-cell',
                    name: 'Toggle edit mode for the focused cell',
                    description: 'Toggle edit mode for the focused cell',
                    keybinding: 'Enter',
                  },
                  {
                    id: 'cancel-editing-for-the-focused-cell',
                    name: 'Cancel editing for the focused cell',
                    description: 'Cancel editing for the focused cell',
                    keybinding: 'Escape',
                  },
                  {
                    id: 'fill-selected-cells-down',
                    name: 'Fill selected cells down',
                    description: 'Fill selected cells down',
                    keybinding: 'Mod+d',
                  },
                  {
                    id: 'open-row-actions-menu',
                    name: 'Open row actions menu',
                    description: 'Open row actions menu',
                    keybinding: 'Mod+Shift+\\',
                  },
                  {
                    id: 'select-item',
                    name: 'Select item',
                    description: 'Select item',
                    keybinding: 'Shift+Space',
                  },
                  {
                    id: 'open-selected-item',
                    name: 'Open selected item',
                    description: 'Open selected item',
                    keybinding: 'Space',
                  },
                  {
                    id: 'archive-items',
                    name: 'Archive items',
                    description: 'Archive items',
                    keybinding: 'E',
                  },
                ],
              },
            },
          })
        }),
      ],
    },
  },
} satisfies Meta<Args>

export const ShortcutsDialogExample: StoryFn<Args> = () => {
  const [visible, setVisible] = useState(true)

  return (
    <>
      <meta name="github-keyboard-shortcuts" content="repository,issues" data-turbo-transient="true" />
      <ShortcutsDialog visible={visible} onVisibleChange={setVisible} docsUrl="https://docs.github.com" />
    </>
  )
}
ShortcutsDialogExample.storyName = 'ShortcutsDialog'
