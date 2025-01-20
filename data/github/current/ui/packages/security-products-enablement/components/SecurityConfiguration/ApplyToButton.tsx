import type React from 'react'
import {ActionMenu, ActionList} from '@primer/react'
import type {OrganizationSecurityConfiguration} from '../../security-products-enablement-types'

interface ApplyToButtonProps {
  configuration: OrganizationSecurityConfiguration
  confirmConfigApplication: (
    config: OrganizationSecurityConfiguration,
    overrideExistingConfig: boolean,
    applyToAll: boolean,
  ) => void
}

const ApplyToButton: React.FC<ApplyToButtonProps> = ({configuration, confirmConfigApplication}) => (
  <ActionMenu>
    <ActionMenu.Button data-testid={`configuration-${configuration.id}-button`}>Apply to</ActionMenu.Button>
    <ActionMenu.Overlay width="medium">
      <ActionList>
        <ActionList.Item onSelect={() => confirmConfigApplication(configuration, true, true)}>
          All repositories
        </ActionList.Item>
        <ActionList.Item onSelect={() => confirmConfigApplication(configuration, false, true)}>
          All repositories without configurations
        </ActionList.Item>
      </ActionList>
    </ActionMenu.Overlay>
  </ActionMenu>
)

export default ApplyToButton
