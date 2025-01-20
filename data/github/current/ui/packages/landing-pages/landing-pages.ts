import {jsonRoute} from '@github-ui/react-core/json-route'
import {registerReactAppFactory} from '@github-ui/react-core/register-app'

import {App} from './App'

import {ActionsIndex} from './routes/features/ActionsIndex'
import {BoomTown} from './routes/BoomTown'
import {CodeReviewIndex} from './routes/features/CodeReviewIndex'
import {CodeSearchIndex} from './routes/features/CodeSearchIndex'
import {CodespacesIndex} from './routes/features/CodespacesIndex'
import {CopilotIndex} from './routes/CopilotIndex'
import {CopilotPlansIndex} from './routes/copilot/PlansIndex'
import {DiscussionsIndex} from './routes/features/DiscussionsIndex'
import {DiversityIndex} from './routes/about/diversity/DiversityIndex'
import {EnterpriseAdvancedSecurityIndex} from './routes/enterprise/AdvancedSecurityIndex'
import {EnterpriseIndex} from './routes/EnterpriseIndex'
import {FeaturesIndex} from './routes/features/FeaturesIndex'
import {IssuesIndex} from './routes/features/IssuesIndex'
import {PackagesIndex} from './routes/features/PackagesIndex'
import {ShowPage} from './routes/ShowPage'
import {ThankYouPage} from './routes/ThankYouPage'

registerReactAppFactory('landing-pages', () => ({
  App,
  routes: [
    jsonRoute({path: '/about/diversity', Component: DiversityIndex}),
    jsonRoute({path: '/contact-sales/thank-you', Component: ThankYouPage}),
    jsonRoute({path: '/enterprise', Component: EnterpriseIndex}),
    jsonRoute({path: '/enterprise/advanced-security', Component: EnterpriseAdvancedSecurityIndex}),
    jsonRoute({path: '/features', Component: FeaturesIndex}),
    jsonRoute({path: '/features/actions', Component: ActionsIndex}),
    jsonRoute({path: '/features/code-review', Component: CodeReviewIndex}),
    jsonRoute({path: '/features/code-search', Component: CodeSearchIndex}),
    jsonRoute({path: '/features/codespaces', Component: CodespacesIndex}),
    jsonRoute({path: '/features/copilot', Component: CopilotIndex}),
    jsonRoute({path: '/features/copilot/plans', Component: CopilotPlansIndex}),
    jsonRoute({path: '/features/discussions', Component: DiscussionsIndex}),
    jsonRoute({path: '/features/issues', Component: IssuesIndex}),
    jsonRoute({path: '/features/packages', Component: PackagesIndex}),

    /**
     * We use this route to exercise error handling and exception reporting.
     * in the app. The BoomTown component simply throws an error when it renders.
     */
    jsonRoute({path: '/contentful-lp-tests/boomtown', Component: BoomTown}),

    jsonRoute({path: '*', Component: ShowPage}),
  ],
}))
