import {isMacOS} from '@github-ui/get-os'

export const HOTKEYS = {
  commandSymbol: isMacOS() ? '⌘' : 'Ctrl',
  enterSymbol: '↵',
  enter: 'Enter',
  openIssueCreateDialog: 'c',
}
