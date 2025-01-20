import type React from 'react'
import {ControlGroup} from '@github-ui/control-group'
import {Box, Text, Label} from '@primer/react'
import {ShieldCheckIcon} from '@primer/octicons-react'
import {useSearchParams} from 'react-router-dom'
import {OnboardingTipBanner} from '@github-ui/onboarding-tip-banner'
import {orgOnboardingAdvancedSecurityPath} from '@github-ui/paths'

import Setting from '../SecurityConfiguration/Setting'
import {useAppContext} from '../../contexts/AppContext'
import {useSecuritySettingsContext} from '../../contexts/SecuritySettingsContext'

const SecretScanning: React.FC = () => {
  const {
    organization,
    securityProducts: {
      secret_scanning: {availability},
    },
  } = useAppContext()
  const {
    secretScanning: secretScanningValue,
    secretScanningValidityChecks: validityChecksValue,
    secretScanningPushProtection: pushProtectionValue,
    secretScanningNonProviderPatterns: nonProviderPatternsValue,
    handleGhasSettingChange: onChange,
    renderInlineValidation,
    isAvailable,
    featureFlags,
  } = useSecuritySettingsContext()
  const validityChecksEnabled = featureFlags?.secretScanningValidityChecks
  const [searchParams] = useSearchParams()
  const showTip = searchParams.get('tip') === 'secret_scanning'

  return (
    isAvailable(availability) && (
      <Box sx={{marginY: 4}}>
        {showTip && (
          <OnboardingTipBanner
            link={orgOnboardingAdvancedSecurityPath({org: organization})}
            icon={ShieldCheckIcon}
            linkText="Back to onboarding"
            heading="Secret scanning"
          >
            Detect and prevent secret leaks across more than 200 token types and your unique custom patterns too, with
            GitHub’s native secret scanning capabilities.
          </OnboardingTipBanner>
        )}
        <div style={{marginBottom: 12}}>
          <Text as="strong" sx={{fontSize: 2}}>
            Secret scanning
          </Text>{' '}
          <Label>GitHub Advanced Security</Label>
        </div>
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title>Alerts</ControlGroup.Title>
            <ControlGroup.Description>
              Receive alerts for detected secrets, keys, or other tokens.
              {renderInlineValidation('secret_scanning')}
            </ControlGroup.Description>
            <ControlGroup.Custom>
              <Setting name="secretScanning" value={secretScanningValue} onChange={onChange} />
            </ControlGroup.Custom>
          </ControlGroup.Item>
          {validityChecksEnabled && (
            <ControlGroup.Item nestedLevel={1}>
              <ControlGroup.Title>Validity checks</ControlGroup.Title>
              <ControlGroup.Description>
                Verify if a secret is valid by sending it to the relevant partner. GitHub will check detected
                credentials via an external API call to the provider.
                {renderInlineValidation('secret_scanning_validity_checks')}
              </ControlGroup.Description>
              <ControlGroup.Custom>
                <Setting name="secretScanningValidityChecks" value={validityChecksValue} onChange={onChange} />
              </ControlGroup.Custom>
            </ControlGroup.Item>
          )}
          <ControlGroup.Item nestedLevel={1}>
            <ControlGroup.Title>Non-provider patterns</ControlGroup.Title>
            <ControlGroup.Description>
              Scan for non-provider patterns.
              {renderInlineValidation('secret_scanning_non_provider_patterns')}
            </ControlGroup.Description>
            <ControlGroup.Custom>
              <Setting name="secretScanningNonProviderPatterns" value={nonProviderPatternsValue} onChange={onChange} />
            </ControlGroup.Custom>
          </ControlGroup.Item>
          <ControlGroup.Item nestedLevel={1}>
            <ControlGroup.Title>Push protection</ControlGroup.Title>
            <ControlGroup.Description>
              Block commits that contain supported secrets.
              {renderInlineValidation('secret_scanning_push_protection')}
            </ControlGroup.Description>
            <ControlGroup.Custom>
              <Setting name="secretScanningPushProtection" value={pushProtectionValue} onChange={onChange} />
            </ControlGroup.Custom>
          </ControlGroup.Item>
        </ControlGroup>
      </Box>
    )
  )
}

export default SecretScanning
