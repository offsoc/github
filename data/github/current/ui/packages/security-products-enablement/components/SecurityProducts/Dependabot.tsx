import type React from 'react'
import {ControlGroup} from '@github-ui/control-group'
import {Label} from '@primer/react'

import {useAppContext} from '../../contexts/AppContext'
import {useSecuritySettingsContext} from '../../contexts/SecuritySettingsContext'
import Setting from '../SecurityConfiguration/Setting'

const Dependabot: React.FC = () => {
  const {
    securityProducts: {
      dependabot_alerts: {availability: alertsAvailability},
      dependabot_updates: {availability: updatesAvailability},
      dependabot_vea: {availability: veaAvailability},
    },
    capabilities: {ghasPurchased},
  } = useAppContext()
  const {
    dependabotAlerts: alertsValue,
    dependabotSecurityUpdates: updatesValue,
    dependabotAlertsVEA: veaValue,
    handleSettingChange: onSettingChange,
    renderInlineValidation,
    isAvailable,
  } = useSecuritySettingsContext()

  return (
    isAvailable(alertsAvailability) && (
      <>
        <ControlGroup.Item nestedLevel={1}>
          <ControlGroup.Title>Dependabot alerts</ControlGroup.Title>
          <ControlGroup.Description>
            Receive alerts for vulnerabilities that affect your dependencies.
            {renderInlineValidation('dependabot_alerts')}
          </ControlGroup.Description>
          <ControlGroup.Custom>
            <Setting name="dependabotAlerts" value={alertsValue} onChange={onSettingChange} />
          </ControlGroup.Custom>
        </ControlGroup.Item>
        {isAvailable(veaAvailability) && ghasPurchased && (
          <ControlGroup.Item nestedLevel={2}>
            <ControlGroup.Title>
              <div>
                <span>Vulnerable function calls</span> <Label>GitHub Advanced Security</Label>
              </div>
            </ControlGroup.Title>
            <ControlGroup.Description>
              See where your code calls vulnerable functions. Enabled when GitHub Advanced Security and Dependabot
              alerts are enabled.
              {renderInlineValidation('dependabot_alerts_vea')}
            </ControlGroup.Description>
            <ControlGroup.Custom>
              <Setting name="dependabotAlertsVEA" disabled value={veaValue} onChange={onSettingChange} />
            </ControlGroup.Custom>
          </ControlGroup.Item>
        )}
        {isAvailable(updatesAvailability) && (
          <ControlGroup.Item nestedLevel={2}>
            <ControlGroup.Title>Security updates</ControlGroup.Title>
            <ControlGroup.Description>
              Allow Dependabot to open pull requests automatically to resolve alerts. For more specific pull request
              configurations, disable this setting to use Dependabot rules.
              {renderInlineValidation('dependabot_security_updates')}
            </ControlGroup.Description>
            <ControlGroup.Custom>
              <Setting name="dependabotSecurityUpdates" value={updatesValue} onChange={onSettingChange} />
            </ControlGroup.Custom>
          </ControlGroup.Item>
        )}
      </>
    )
  )
}

export default Dependabot
