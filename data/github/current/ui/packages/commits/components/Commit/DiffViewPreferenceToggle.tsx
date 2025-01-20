import {ActionList} from '@primer/react'

import {useDiffViewSettings} from '../../contexts/DiffViewSettingsContext'

export function DiffViewPreferenceToggle() {
  const {splitPreference, updateSplitPreference} = useDiffViewSettings()

  return (
    <ActionList.Group selectionVariant="single">
      <ActionList.GroupHeading>Layout</ActionList.GroupHeading>
      <ActionList.Item selected={splitPreference === 'unified'} onSelect={() => updateSplitPreference('unified')}>
        Unified
      </ActionList.Item>
      <ActionList.Item selected={splitPreference === 'split'} onSelect={() => updateSplitPreference('split')}>
        Split
      </ActionList.Item>
    </ActionList.Group>
  )
}
