import type React from 'react'
import {CheckIcon, DashIcon} from '@primer/octicons-react'
import {Octicon, ActionList, ActionMenu, useTheme} from '@primer/react'

import type {SecuritySettings, SecuritySettingOnChange} from '../../security-products-enablement-types'
import {SettingValue} from '../../security-products-enablement-types'
import {useAppContext} from '../../contexts/AppContext'

type Description = {description: string}
interface Overrides {
  enabled?: Description
  disabled?: Description
  notSet?: Description
}
export interface SettingProps {
  name: keyof SecuritySettings
  value: SettingValue
  onChange: SecuritySettingOnChange
  disabled?: boolean
  children?: React.ReactNode
  overrides?: Overrides
}

const settingStatusLabel = (value: SettingValue) => {
  switch (value) {
    case SettingValue.Enabled:
      return 'Enabled'
    case SettingValue.Disabled:
      return 'Disabled'
    case SettingValue.NotSet:
      return 'Not set'
  }
}

const Setting: React.FC<SettingProps> = ({name, value, onChange, disabled = false, overrides, children}) => {
  const {theme} = useTheme()
  const {securityConfiguration} = useAppContext()
  const showOnly = securityConfiguration?.target_type === 'global'

  const settingStatus = children || (
    <ActionMenu>
      <ActionMenu.Button data-testid={name}>{settingStatusLabel(value)}</ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          <ActionList.Item
            selected={value === SettingValue.Enabled}
            onSelect={() => onChange(name, SettingValue.Enabled)}
          >
            Enabled
            <ActionList.Description variant="block">
              Override existing repository settings and enable this feature.
            </ActionList.Description>
          </ActionList.Item>

          <ActionList.Item
            selected={value === SettingValue.Disabled}
            onSelect={() => onChange(name, SettingValue.Disabled)}
          >
            Disabled
            <ActionList.Description variant="block">
              {overrides?.disabled?.description || `Override existing repository settings and disable this feature.`}
            </ActionList.Description>
          </ActionList.Item>

          <ActionList.Item
            selected={value === SettingValue.NotSet}
            onSelect={() => onChange(name, SettingValue.NotSet)}
          >
            Not set
            <ActionList.Description variant="block">
              Do not override existing repository settings for this feature.
            </ActionList.Description>
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )

  const setting = () => {
    if (disabled) {
      return <span data-testid={name}>{settingStatusLabel(value)}</span>
    } else if (showOnly) {
      const icon = value === SettingValue.Enabled ? CheckIcon : DashIcon
      const color = value === SettingValue.Enabled ? theme?.colors.open.fg : 'fg.subtitle'
      return (
        <div data-testid="setting-status">
          <Octicon icon={icon} size={16} sx={{color}} /> {settingStatusLabel(value)}
        </div>
      )
    } else {
      return settingStatus
    }
  }

  return setting()
}

export default Setting
