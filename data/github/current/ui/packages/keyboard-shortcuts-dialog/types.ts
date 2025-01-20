import type {NormalizedSequenceString} from '@github-ui/hotkey'

export interface Shortcut {
  id: string
  name: string
  description: string
  /** Can be an array if multiple keybindings map to this shortcut. */
  keybinding: NormalizedSequenceString | NormalizedSequenceString[]
}

export interface ShortcutsGroup {
  service: {
    id: string
    name: string
  }
  commands: Shortcut[]
}
