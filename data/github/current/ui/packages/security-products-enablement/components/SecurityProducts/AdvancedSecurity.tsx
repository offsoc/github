import type React from 'react'
import {ActionList, ActionMenu, Box, Link as PrimerLink, Octicon, useTheme} from '@primer/react'
import {CheckIcon, DashIcon} from '@primer/octicons-react'
import {ControlGroup} from '@github-ui/control-group'

import {useAppContext} from '../../contexts/AppContext'
import {useSecuritySettingsContext} from '../../contexts/SecuritySettingsContext'

interface AdvancedSecurityProps {
  handleOnSelectGHAS: (value: string) => void
}

const AdvancedSecurity: React.FC<AdvancedSecurityProps> = ({handleOnSelectGHAS}) => {
  const {
    capabilities: {ghasPurchased, actionsAreBilled, ghasFreeForPublicRepos},
    securityConfiguration,
    docsUrls,
  } = useAppContext()
  const {theme} = useTheme()
  const {enableGHAS: enabled, renderInlineValidation} = useSecuritySettingsContext()
  const showOnly = securityConfiguration?.target_type === 'global'
  const text = enabled ? 'Include' : 'Exclude'
  // In GHES, GHAS is not free for public repos and Actions are not a billable product
  const ghesGhasNotFree = !ghasFreeForPublicRepos && !actionsAreBilled
  const enablementStatusShowOnly = () => {
    const color = enabled ? theme?.colors.open.fg : 'fg.subtle'
    const icon = enabled ? CheckIcon : DashIcon

    return (
      <div>
        <Octicon icon={icon} size={16} sx={{color}} /> {text}
      </div>
    )
  }

  const enablementStatus = (
    <ActionMenu>
      <ActionMenu.Button data-testid="enable-ghas-dropdown" id="enable-ghas-button" style={{width: '99px'}}>
        {text}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          <ActionList.Item selected={enabled} onSelect={() => handleOnSelectGHAS('include')}>
            Include
            <ActionList.Description variant="block">
              Enable GitHub Advanced Security for this configuration.{' '}
              {ghesGhasNotFree
                ? 'Applying it will consume licenses.'
                : 'Applying it to private repositories will consume licenses.'}
            </ActionList.Description>
          </ActionList.Item>
          <ActionList.Item selected={!enabled} onSelect={() => handleOnSelectGHAS('exclude')}>
            Exclude
            <ActionList.Description variant="block">
              Disable all GitHub Advanced Security features in this configuration.{' '}
              {ghesGhasNotFree
                ? 'Applying it will not consume licenses.'
                : 'Applying it to private repositories will not consume licenses.'}
            </ActionList.Description>
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )

  return (
    ghasPurchased && (
      <Box sx={{marginY: 4}}>
        <ControlGroup>
          <ControlGroup.Item>
            <ControlGroup.Title>GitHub Advanced Security features</ControlGroup.Title>
            <ControlGroup.Description>
              {ghesGhasNotFree
                ? 'Advanced Security features are billed per active committer.'
                : 'Advanced Security features are free for public repositories and billed per active committer in private and internal repositories.'}
              <br />
              <PrimerLink inline href={docsUrls.ghasBilling}>
                Learn more about Advanced Security billing
              </PrimerLink>
              {renderInlineValidation('enable_ghas')}
            </ControlGroup.Description>
            <ControlGroup.Custom>{showOnly ? enablementStatusShowOnly() : enablementStatus}</ControlGroup.Custom>
          </ControlGroup.Item>
        </ControlGroup>
      </Box>
    )
  )
}

export default AdvancedSecurity
