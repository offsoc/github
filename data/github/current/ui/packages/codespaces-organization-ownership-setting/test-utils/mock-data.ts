import type {CodespacesOrganizationOwnershipSettingProps} from '../CodespacesOrganizationOwnershipSetting'

export function getCodespacesOrganizationOwnershipSettingProps(): CodespacesOrganizationOwnershipSettingProps {
  return {
    currentValue: 'organization',
    disabled: false,
    submitUrl: '/fakeurl',
  }
}
