import type React from 'react'
import {ControlGroup} from '@github-ui/control-group'
import {Box, Text, Label} from '@primer/react'
import {ShieldCheckIcon} from '@primer/octicons-react'
import {useSearchParams} from 'react-router-dom'
import {OnboardingTipBanner} from '@github-ui/onboarding-tip-banner'
import {orgOnboardingAdvancedSecurityPath} from '@github-ui/paths'

import {useAppContext} from '../../contexts/AppContext'
import {useSecuritySettingsContext} from '../../contexts/SecuritySettingsContext'
import Setting from '../SecurityConfiguration/Setting'

const CodeScanning: React.FC = () => {
  const {
    organization,
    securityProducts: {
      code_scanning: {availability},
    },
    capabilities: {ghasFreeForPublicRepos, actionsAreBilled},
  } = useAppContext()
  const {
    codeScanning: defaultSetupValue,
    renderInlineValidation,
    handleGhasSettingChange: onChange,
    isAvailable,
  } = useSecuritySettingsContext()
  const [searchParams] = useSearchParams()
  const showTip = searchParams.get('tip') === 'code_scanning'

  return (
    isAvailable(availability) && (
      <Box sx={{marginY: 4}}>
        {showTip && (
          <OnboardingTipBanner
            link={orgOnboardingAdvancedSecurityPath({org: organization})}
            icon={ShieldCheckIcon}
            linkText="Back to onboarding"
            heading="Code scanning"
          >
            Effortlessly prevent and fix vulnerabilities while you write code without leaving your workflow with
            GitHub’s native code scanning capabilities.
          </OnboardingTipBanner>
        )}
        <div style={{marginBottom: 12}}>
          <Text as="strong" sx={{fontSize: 2}}>
            Code scanning
          </Text>{' '}
          <Label>GitHub Advanced Security</Label>
        </div>
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title>Default setup</ControlGroup.Title>
            <ControlGroup.Description>
              Receive alerts for automatically detected vulnerabilities and coding errors using CodeQL default
              configuration.{' '}
              {ghasFreeForPublicRepos &&
                actionsAreBilled &&
                'Code scanning uses GitHub Actions and costs Actions minutes.'}
            </ControlGroup.Description>
            <ControlGroup.Custom>
              <Setting name="codeScanning" value={defaultSetupValue} onChange={onChange} />
            </ControlGroup.Custom>
          </ControlGroup.Item>
          {renderInlineValidation('code_scanning')}
        </ControlGroup>
      </Box>
    )
  )
}

export default CodeScanning
