import type React from 'react'
import capitalize from 'lodash-es/capitalize'
import pluralize from 'pluralize'
import {Link as PrimerLink} from '@primer/react'
import {Link} from '@github-ui/react-core/link'
import {settingsOrgSecurityConfigurationsEditPath, settingsOrgSecurityConfigurationsViewPath} from '@github-ui/paths'
import type {OrganizationSecurityConfiguration} from '../../security-products-enablement-types'
import {useAppContext} from '../../contexts/AppContext'
import ApplyToButton from './ApplyToButton'
import RowLabel from '../RowLabel'

interface SecurityConfigurationRowProps {
  configuration: OrganizationSecurityConfiguration
  isLast: boolean
  isGithubRecommended?: boolean
  confirmConfigApplication: (
    config: OrganizationSecurityConfiguration,
    overrideExistingConfig: boolean,
    applyToAll: boolean,
  ) => void
}

const SecurityConfigurationRow: React.FC<SecurityConfigurationRowProps> = ({
  configuration,
  isLast,
  isGithubRecommended = false,
  confirmConfigApplication,
}) => {
  const {organization, capabilities} = useAppContext()
  const {
    default_for_new_private_repos,
    default_for_new_public_repos,
    id,
    name,
    enable_ghas,
    enforcement,
    description,
    repositories_count,
  } = configuration

  // Determine the link path based on whether it's a GitHub recommended configuration or not
  const linkPath = isGithubRecommended
    ? settingsOrgSecurityConfigurationsViewPath({org: organization})
    : settingsOrgSecurityConfigurationsEditPath({org: organization, id})

  const boxClassNames = `border-x border-bottom py-3 px-3${isLast ? ' rounded-bottom-2' : ''}`

  const getDefaultText = () => {
    if (default_for_new_private_repos && default_for_new_public_repos) {
      return 'Default for all new repositories.'
    } else if (default_for_new_private_repos) {
      return 'Default for new private and internal repositories.'
    } else {
      return 'Default for new public repositories.'
    }
  }

  return (
    <div className={boxClassNames} data-testid={`configuration-${id}`}>
      <div className="d-flex flex-items-center">
        <div className="text-bold mb-1 flex-1">
          <PrimerLink as={Link} to={linkPath} sx={{color: 'fg.default'}} data-testid={`configuration-${id}-name`}>
            {name.length > 0 ? name : 'unnamed security configuration'}
          </PrimerLink>
          {enable_ghas && capabilities.ghasPurchased && <RowLabel text="GitHub Advanced Security" />}
          {enforcement === 'enforced' && <RowLabel text={capitalize(enforcement)} />}
          <div className="f6 color-fg-muted text-normal" data-testid={`configuration-${id}-description`}>
            {description}{' '}
            {(default_for_new_private_repos || default_for_new_public_repos) && (
              <span className="text-bold">{getDefaultText()}</span>
            )}
          </div>
        </div>
        <div className="f6 m-3 color-fg-muted flex-2" data-testid={`configuration-${id}-repositories-count`}>
          {pluralize('repository', repositories_count, true)}
        </div>
        <ApplyToButton configuration={configuration} confirmConfigApplication={confirmConfigApplication} />
      </div>
    </div>
  )
}

export default SecurityConfigurationRow
