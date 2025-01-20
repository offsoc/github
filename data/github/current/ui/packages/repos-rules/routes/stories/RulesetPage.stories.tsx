import {Wrapper} from '@github-ui/react-core/test-utils'
import type {Meta, StoryObj} from '@storybook/react'

import {RulesetPage as RulesetPageComponent} from '../RulesetPage'

import {mockOrganization, rulesetRoutePayload} from '../../state/__tests__/helpers'

type RulesetPageType = typeof RulesetPageComponent

const meta: Meta<RulesetPageType> = {
  title: 'Apps/Rulesets/Ruleset Page',
  component: RulesetPageComponent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    readOnly: {
      control: 'boolean',
      defaultValue: false,
    },
  },
}

const ignoreColorContrastConfig = {
  parameters: {
    a11y: {
      element: '#storybook-root',
      config: {
        rules: [
          {
            id: 'color-contrast',
            selector: '*:not([data-testid="ruleset-buttons"] span)',
          },
        ],
      },
    },
  },
}

const defaultArgs: Partial<RulesetPageType> = rulesetRoutePayload

export default meta

type Story = StoryObj<RulesetPageType>

const SudoPrompt = () => (
  <div>
    <template
      className="js-sudo-prompt"
      /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{
        __html: `
          <div class="Box-header Box-header--blue">
            <h1 class="Box-title">
              Confirm access
            </h1>
          </div>
          <div class="session-authentication px-3 pb-3 pt-3">
            <form class="js-sudo-password-form" onsubmit="this.dispatchEvent(new Event('toggle'))">
              <button class="btn" type="submit">Sudo!</button>
            </form>
          </div>
      `,
      }}
    />
    <template
      id="site-details-dialog"
      /* eslint-disable-next-line react/no-danger */
      dangerouslySetInnerHTML={{
        __html: `
      <details class="details-reset details-overlay details-overlay-dark lh-default color-fg-default hx_rsm" open>
        <summary role="button" aria-label="Close dialog"></summary>
        <details-dialog class="Box Box--overlay d-flex flex-column anim-fade-in fast hx_rsm-dialog hx_rsm-modal">
          <button class="Box-btn-octicon m-0 btn-octicon position-absolute right-0 top-0" type="button" aria-label="Close dialog" data-close-dialog>
            <div>X</div>
          </button>
          <div class="octocat-spinner my-6 js-details-dialog-spinner"></div>
        </details-dialog>
      </details>
    `,
      }}
    />
  </div>
)

export const RepositoryRuleset: Story = {
  ...ignoreColorContrastConfig,
  render: args => {
    return (
      <Wrapper
        pathname="/monalisa/smile/settings/rules/1"
        routePayload={{
          ...defaultArgs,
          ...(args as typeof rulesetRoutePayload),
          upsellInfo: {
            organization: false,
            rulesets: {
              featureEnabled: false,
              cta: {
                visible: true,
                path: '/',
              },
            },
            enterpriseRulesets: {
              featureEnabled: false,
              cta: {
                visible: true,
                path: '/',
              },
            },
          },
        }}
        appPayload={{
          enabled_features: {},
        }}
      >
        <SudoPrompt />
        <RulesetPageComponent />
      </Wrapper>
    )
  },
}

export const OrganizationRuleset: Story = {
  ...ignoreColorContrastConfig,
  render: args => {
    return (
      <Wrapper
        pathname="/organizations/github/settings/rules/2"
        routePayload={{
          ...defaultArgs,
          ...{
            sourceType: 'organization',
            source: mockOrganization,
            supportedConditionTargetObjects: ['repository', 'ref'],
          },
          ...(args as typeof rulesetRoutePayload),
          upsellInfo: {
            organization: true,
            rulesets: {
              featureEnabled: false,
              cta: {
                visible: true,
                path: '/',
              },
            },
            enterpriseRulesets: {
              featureEnabled: true,
              cta: {
                visible: false,
                path: '/',
              },
            },
          },
        }}
        appPayload={{
          enabled_features: {},
        }}
      >
        <SudoPrompt />
        <RulesetPageComponent />
      </Wrapper>
    )
  },
}
