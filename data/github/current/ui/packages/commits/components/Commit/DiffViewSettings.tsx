import {GearIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu} from '@primer/react'

import {DiffViewPreferenceToggle} from './DiffViewPreferenceToggle'
import {DiffWhitespaceToggle} from './DiffWhitespaceToggle'

export function DiffViewSettings() {
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <button className="Button Button--iconOnly Button--invisible ml-2" aria-label="Diff view settings">
          <GearIcon />
        </button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          <DiffViewPreferenceToggle />
          <ActionList.Divider />
          <DiffWhitespaceToggle />
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
