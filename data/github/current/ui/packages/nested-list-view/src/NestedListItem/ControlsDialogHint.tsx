import {CommandKeybindingHint} from '@github-ui/ui-commands'

import styles from './ControlsDialogHint.module.css'

export function ControlsDialogHint() {
  return (
    <div className={styles.hint}>
      <span>Manage this item</span>{' '}
      <CommandKeybindingHint commandId="list-views:open-manage-item-dialog" format="condensed" />
    </div>
  )
}
