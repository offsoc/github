import {App} from './App'
import {RepositorySecurityCampaignShow} from './routes/RepositorySecurityCampaignShow'
import {OrgSecurityCampaignShow} from './routes/OrgSecurityCampaignShow'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {ClosedSecurityCampaigns} from './routes/ClosedSecurityCampaigns'

registerReactAppFactory('security-campaigns', () => ({
  App,
  routes: [
    jsonRoute({path: '/:owner/:repo/security/campaigns/:number', Component: RepositorySecurityCampaignShow}),
    jsonRoute({path: '/orgs/:owner/security/campaigns/:number', Component: OrgSecurityCampaignShow}),
    jsonRoute({path: '/orgs/:owner/security/campaigns/closed', Component: ClosedSecurityCampaigns}),
  ],
}))
