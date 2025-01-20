import {normalizeSequence} from '@github-ui/hotkey'
import type {Meta, StoryFn} from '@storybook/react'
import {ShortcutsGroupList} from './ShortcutsGroupList'

export default {
  title: 'KeyboardShortcutsDialog/ShortcutsGroupList',
} satisfies Meta

export const ShortcutsGroupListExample: StoryFn = () => (
  <ShortcutsGroupList
    group={{
      service: {id: 'manipulating-project', name: 'Manipulating a Project'},
      commands: [
        {
          id: 'toggle-edit-mode-for-the-focused-cell',
          name: 'Toggle edit mode for the focused cell',
          description: 'Toggle edit mode for the focused cell',
          keybinding: normalizeSequence('Enter'),
        },
        {
          id: 'cancel-editing-for-the-focused-cell',
          name: 'Cancel editing for the focused cell',
          description: 'Cancel editing for the focused cell',
          keybinding: normalizeSequence('Escape'),
        },
        {
          id: 'fill-selected-cells-down',
          name: 'Fill selected cells down',
          description: 'Fill selected cells down',
          keybinding: normalizeSequence('Mod+d'),
        },
        {
          id: 'open-row-actions-menu',
          name: 'Open row actions menu',
          description: 'Open row actions menu',
          keybinding: normalizeSequence('Mod+Shift+\\'),
        },
        {
          id: 'select-item',
          name: 'Select item',
          description: 'Select item',
          keybinding: normalizeSequence('Shift+Space'),
        },
        {
          id: 'open-selected-item',
          name: 'Open selected item',
          description: 'Open selected item',
          keybinding: normalizeSequence('Space'),
        },
        {
          id: 'archive-items',
          name: 'Archive items',
          description: 'Archive items',
          keybinding: normalizeSequence('E'),
        },
      ],
    }}
  />
)
ShortcutsGroupListExample.storyName = 'ShortcutsGroupList'
