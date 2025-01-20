import {ActionList} from '@primer/react'

import {type UserSetting, useUserSettings} from '../user-settings'

export const RoadmapUserSettingsMenu = () => {
  const {roadmapTruncateTitles, roadmapShowDateFields} = useUserSettings()

  return (
    <>
      <OptionsElement option={roadmapTruncateTitles} />
      <OptionsElement option={roadmapShowDateFields} />
    </>
  )
}

export function OptionsElement({option}: {option: UserSetting}) {
  return (
    <ActionList.Item
      role="menuitemcheckbox"
      selected={option.enabled}
      key={option.name}
      onSelect={option.toggleEnabled}
    >
      {option.label}
    </ActionList.Item>
  )
}
