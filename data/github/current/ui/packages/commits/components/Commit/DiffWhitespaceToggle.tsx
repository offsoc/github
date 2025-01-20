import {ActionList} from '@primer/react'

import {useDiffViewSettings} from '../../contexts/DiffViewSettingsContext'

export function DiffWhitespaceToggle() {
  const {hideWhitespace, updateHideWhitespace} = useDiffViewSettings()

  return (
    <ActionList.Group selectionVariant="single" variant="subtle">
      <ActionList.GroupHeading>Whitespace</ActionList.GroupHeading>
      <ActionList.Item selected={hideWhitespace} onSelect={() => updateHideWhitespace(!hideWhitespace)}>
        Hide whitespace
      </ActionList.Item>
    </ActionList.Group>
  )
}
