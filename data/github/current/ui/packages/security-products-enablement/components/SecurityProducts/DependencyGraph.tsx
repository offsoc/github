import type React from 'react'
import {ControlGroup} from '@github-ui/control-group'
import {ActionList, ActionMenu, Box, Text} from '@primer/react'

import {useAppContext} from '../../contexts/AppContext'
import {useSecuritySettingsContext} from '../../contexts/SecuritySettingsContext'
import {SettingValue, type SettingOptions} from '../../security-products-enablement-types'
import Setting from '../SecurityConfiguration/Setting'
import Dependabot from './Dependabot'

export const DependencyGraphAutosubmitActionDefaultOptions = {labeled_runners: false}

function settingStatusLabel(value: SettingValue, options?: SettingOptions) {
  switch (value) {
    case SettingValue.Enabled:
      if (options!.labeled_runners) {
        return 'Enabled for labeled runners'
      } else {
        return 'Enabled'
      }
    case SettingValue.Disabled:
      return 'Disabled'
    case SettingValue.NotSet:
      return 'Not set'
  }
}

const DependencyGraph: React.FC = () => {
  const {
    securityProducts: {
      dependency_graph: {availability: dependencyGraphAvailability, configurablePerRepo},
      dependency_graph_autosubmit_action: {availability: autsubmitActionAvailability},
    },
  } = useAppContext()
  const {
    dependencyGraph: dependencyGraphValue,
    dependencyGraphAutosubmitAction: autosubmitActionValue,
    dependencyGraphAutosubmitActionOptions: autosubmitActionOptions,
    renderInlineValidation,
    handleSettingChange: onChange,
    isAvailable,
  } = useSecuritySettingsContext()
  const disableDescriptionText =
    'Override existing repository settings and disable this feature. Dependency graph cannot be disabled in public repositories.'

  const autosubmitAction = () => {
    const name = 'dependencyGraphAutosubmitAction'

    return (
      <ActionMenu>
        <ActionMenu.Button data-testid={name}>
          {settingStatusLabel(autosubmitActionValue, autosubmitActionOptions)}
        </ActionMenu.Button>
        <ActionMenu.Overlay width="medium">
          <ActionList selectionVariant="single">
            <ActionList.Item
              selected={
                autosubmitActionValue === SettingValue.Enabled && !(autosubmitActionOptions.labeled_runners as boolean)
              }
              onSelect={() => onChange(name, SettingValue.Enabled, DependencyGraphAutosubmitActionDefaultOptions)}
            >
              Enabled
              <ActionList.Description variant="block">
                Override existing repository settings and enable this feature.
              </ActionList.Description>
            </ActionList.Item>

            <ActionList.Item
              selected={
                autosubmitActionValue === SettingValue.Enabled && (autosubmitActionOptions.labeled_runners as boolean)
              }
              onSelect={() => onChange(name, SettingValue.Enabled, {labeled_runners: true})}
            >
              Enabled for labeled runners
              <ActionList.Description variant="block">
                {"Override and enable this feature on runners labeled 'dependency-submission'."}
              </ActionList.Description>
            </ActionList.Item>

            <ActionList.Item
              selected={autosubmitActionValue === SettingValue.Disabled}
              onSelect={() => onChange(name, SettingValue.Disabled, DependencyGraphAutosubmitActionDefaultOptions)}
            >
              Disabled
              <ActionList.Description variant="block">
                Override existing repository settings and disable this feature.
              </ActionList.Description>
            </ActionList.Item>

            <ActionList.Item
              selected={autosubmitActionValue === SettingValue.NotSet}
              onSelect={() => onChange(name, SettingValue.NotSet, DependencyGraphAutosubmitActionDefaultOptions)}
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
  }

  return (
    isAvailable(dependencyGraphAvailability) && (
      <Box sx={{marginY: 4}}>
        <div style={{marginBottom: 12}}>
          <Text as="strong" sx={{fontSize: 2}}>
            Dependency graph and Dependabot
          </Text>
        </div>
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title>Dependency graph</ControlGroup.Title>
            <ControlGroup.Description>
              Display license information and vulnerability severity for your dependencies.
              {configurablePerRepo
                ? ' Always enabled for public repositories.'
                : ' This setting is installed and managed at the instance level.'}
              {renderInlineValidation('dependency_graph')}
            </ControlGroup.Description>
            <ControlGroup.Custom>
              <Setting
                name="dependencyGraph"
                value={dependencyGraphValue}
                disabled={!configurablePerRepo}
                onChange={onChange}
                overrides={{disabled: {description: disableDescriptionText}}}
              />
            </ControlGroup.Custom>
          </ControlGroup.Item>
          {isAvailable(autsubmitActionAvailability) && (
            <ControlGroup.Item nestedLevel={1}>
              <ControlGroup.Title>Automatic dependency submission</ControlGroup.Title>
              <ControlGroup.Description>
                Automatically detect and report build-time dependencies for select ecosystems. Automatic dependency
                submission uses GitHub Actions and costs Actions minutes.
                {renderInlineValidation('dependency_graph_autosubmit_action')}
              </ControlGroup.Description>
              <ControlGroup.Custom>
                <Setting name="dependencyGraphAutosubmitAction" value={autosubmitActionValue} onChange={onChange}>
                  {autosubmitAction()}
                </Setting>
              </ControlGroup.Custom>
            </ControlGroup.Item>
          )}
          <Dependabot />
        </ControlGroup>
      </Box>
    )
  )
}

export default DependencyGraph
