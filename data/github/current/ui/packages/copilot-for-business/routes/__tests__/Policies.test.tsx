import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen, within} from '@testing-library/react'
import {makePoliciesRoutePayload} from '../../test-utils/mock-data'
import Policies from '../Policies'
import {isFeatureEnabled} from '@github-ui/feature-flags'

jest.mock('@github-ui/feature-flags', () => ({
  isFeatureEnabled: jest.fn(),
}))

const mockIsFeatureEnabled = jest.mocked(isFeatureEnabled)

const useCopilotSettingsMutationCommit = jest.fn(({onComplete}) => {
  onComplete({success: true})
})

jest.mock('../../hooks/use-fetchers', () => {
  const actual = jest.requireActual('../../hooks/use-fetchers')

  return {
    ...actual,
    useCreateMutator: jest.fn().mockImplementation(() => () => [useCopilotSettingsMutationCommit, false]),
  }
})

test('renders the index page', () => {
  render(<Policies />, {routePayload: makePoliciesRoutePayload(), appPayload: makeFeatureFlags()})

  expect(screen.getByRole('heading', {level: 2})).toHaveTextContent('GitHub Copilot policies')
})

test('can open option buttons', () => {
  render(<Policies />, {routePayload: makePoliciesRoutePayload(), appPayload: makeFeatureFlags()})

  const btn = screen.getByRole('button', {name: /option 2 editor_chat/})
  expect(btn).toBeInTheDocument()
  expect(btn).not.toBeDisabled()

  fireEvent.click(btn)

  expect(screen.getByRole('menu')).toBeInTheDocument()
  expect(screen.getByRole('menuitemradio', {name: 'option 1 editor_chat'})).toBeInTheDocument()
  expect(screen.getByRole('menuitemradio', {name: 'option 2 editor_chat'})).toBeInTheDocument()
})

test('options have a single selected item', () => {
  render(<Policies />, {routePayload: makePoliciesRoutePayload(), appPayload: makeFeatureFlags()})

  fireEvent.click(screen.getByRole('button', {name: /option 2 editor_chat/}))

  expect(screen.getByRole('menu')).toBeInTheDocument()
  expect(screen.getByRole('menuitemradio', {name: 'option 1 editor_chat'})).not.toBeChecked()
  expect(screen.getByRole('menuitemradio', {name: 'option 2 editor_chat'})).toBeChecked()
})

describe('business logic', () => {
  describe('managed by enterprise show link', () => {
    it('does not show when not managed by enterprise', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          enterprise_name: null,
          enterprise_slug: null,
        }),
      })
      expect(screen.queryByTestId('cfb-managed-organization-enterprise')).not.toBeInTheDocument()
    })

    it('shows link to enterprise when managed by enterprise', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          enterprise_name: 'Alena',
          enterprise_slug: 'alena',
        }),
      })
      const managedBy = screen.getByTestId('cfb-managed-organization-enterprise')
      expect(managedBy).toBeInTheDocument()
      expect(managedBy).toHaveTextContent(/Managed by Alena/)
    })
  })

  describe('mobile chat', () => {
    it('when chat is configurable it shows both the editor and mobile chat features', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          editor_chat: {
            configurable: true,
          },
          mobile_chat: {
            configurable: true,
          },
        }),
      })
      expect(screen.getByTestId('cfb-policies-editor-chat-feature')).toBeInTheDocument()
      expect(screen.getByTestId('cfb-policies-mobile-chat-feature')).toBeInTheDocument()
    })

    it('when chat is not configurable it shows both the editor and mobile chat features', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          editor_chat: {
            configurable: false,
          },
          mobile_chat: {
            configurable: false,
          },
        }),
      })

      expect(screen.getByTestId('cfb-policies-editor-chat-feature')).toHaveTextContent(
        /members of this organization will have access to Copilot Chat in the IDE/,
      )
      expect(screen.getByTestId('cfb-policies-mobile-chat-feature')).toHaveTextContent(
        /members of this organization will have access to Copilot Chat in GitHub Mobile/,
      )
    })

    it('when editor chat is configurable we show the user the chat feature', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          editor_chat: {
            configurable: true,
          },
          mobile_chat: {
            configurable: true,
          },
        }),
      })

      expect(screen.getByTestId('cfb-policies-editor-chat-feature')).toHaveTextContent(
        /members of this organization will have access to Copilot Chat in the IDE/,
      )
    })

    it('when editor chat is not configurable we tell the user about that', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          editor_chat: {
            configurable: false,
          },
        }),
      })

      const chatFeature = screen.getByTestId('cfb-policies-editor-chat-feature')

      expect(chatFeature).toHaveTextContent(
        /If enabled, members of this organization will have access to *Copilot Chat in the IDE./,
      )

      const btn = screen.queryByTestId('cfb-policies-editor-chat-feature-button')
      expect(btn).not.toBeInTheDocument()
      expect(screen.getByTestId('cfb-policies-editor-chat-feature-locked')).toBeInTheDocument()
    })

    it('when mobile chat is configurable we show the user the chat feature', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          editor_chat: {
            configurable: true,
          },
          mobile_chat: {
            configurable: true,
          },
        }),
      })

      expect(screen.getByTestId('cfb-policies-mobile-chat-feature')).not.toHaveTextContent(
        /enterprise administrators.*limited public beta/,
      )
    })

    it('when mobile chat is not configurable we tell the user about that', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          editor_chat: {
            configurable: false,
          },
          mobile_chat: {
            configurable: false,
          },
        }),
      })

      const chatFeature = screen.getByTestId('cfb-policies-mobile-chat-feature')

      expect(chatFeature).toHaveTextContent(
        /If enabled, members of this organization will have access to *Copilot Chat in GitHub Mobile./,
      )

      const btn = screen.queryByTestId('cfb-policies-mobile-chat-feature-button')
      expect(btn).not.toBeInTheDocument()
      expect(screen.getByTestId('cfb-policies-mobile-feature-locked')).toBeInTheDocument()
    })
  })

  it('shows disabled view when copilot for CLI is disabled by the enterprise', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        cli: {
          configurable: false,
        },
      }),
    })

    const cliFeature = screen.getByTestId('cfb-policies-cli-feature')

    expect(cliFeature).toHaveTextContent(
      /If enabled, members of this organization will get *GitHub Copilot assistance in terminal./,
    )

    const btn = screen.queryByTestId('cfb-policies-cli-feature-button')
    expect(btn).not.toBeInTheDocument()
    expect(screen.getByTestId('cfb-policies-cli-feature-locked')).toBeInTheDocument()
  })

  it('shows the enabled view when copilot for CLI is enabled by the enterprise', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        cli: {
          configurable: true,
        },
      }),
    })

    const cliFeature = screen.getByTestId('cfb-policies-cli-feature')

    expect(cliFeature).toHaveTextContent(
      /If enabled, members of this organization will get *GitHub Copilot assistance in terminal./,
    )

    const btn = screen.getByTestId('cfb-policies-cli-feature-button')
    expect(btn).toBeInTheDocument()
    expect(within(btn).getByRole('button')).not.toBeDisabled()
  })

  it('shows the disabled view when Copilot for dotcom is disabled by the enterprise', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: false,
          visible: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    const dotcomBundleFeature = screen.getByTestId('cfb-policies-dotcom-bundle-feature')
    expect(dotcomBundleFeature).toHaveTextContent(
      /If enabled, members of this organization can use Copilot Chat in github.com,Copilot for pull requests, knowledge base search./,
    )
    const footnotes = screen.getByTestId('cb-policies-footnotes')
    expect(footnotes).toHaveTextContent(
      /Enabling Copilot in the CLI, Copilot in github.com and Copilot Chat in GitHub Mobile will collect additional data and updated Product Terms apply. If beta features are enabled, you agree to pre-release terms/,
    )
    const btn = screen.queryByTestId('cfb-policies-dotcom-bundle-feature-button')
    expect(btn).not.toBeInTheDocument()
    expect(screen.getByTestId('cfb-policies-dotcom-feature-locked')).toBeInTheDocument()
  })

  it('shows the enabled view when Copilot for dotcom is enabled by the enterprise', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: true,
          visible: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    const dotcomBundleFeature = screen.getByTestId('cfb-policies-dotcom-bundle-feature')
    expect(dotcomBundleFeature).toHaveTextContent(
      /If enabled, members of this organization can use Copilot Chat in github.com,Copilot for pull requests, knowledge base search./,
    )
    const footnotes = screen.getByTestId('cb-policies-footnotes')
    expect(footnotes).toHaveTextContent(
      /Enabling Copilot in the CLI, Copilot in github.com and Copilot Chat in GitHub Mobile will collect additional data and updated Product Terms apply. If beta features are enabled, you agree to pre-release terms/,
    )
    const btn = screen.getByTestId('cfb-policies-dotcom-bundle-feature-button')
    expect(btn).toBeInTheDocument()
    expect(within(btn).getByRole('button')).not.toBeDisabled()
  })

  it('does not show the Copilot for dotcom policy when the organization is not eligible to see the setting', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: true,
          visible: false,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: false}),
    })

    expect(screen.queryByText('Copilot in github.com')).not.toBeInTheDocument()
    const footnotes = screen.getByTestId('cb-policies-footnotes')
    expect(footnotes).toHaveTextContent(/If beta features are enabled, you agree to pre-release terms./)
    expect(footnotes).not.toHaveTextContent(
      /Enabling Copilot in github.com will collect additional data and updated Product Terms apply. If beta features are enabled, you agree to pre-release terms./,
    )
    expect(screen.queryByTestId('cfb-policies-dotcom-bundle-feature')).not.toBeInTheDocument()
    expect(screen.queryByTestId('cfb-policies-dotcom-bundle-feature-button')).not.toBeInTheDocument()
  })

  describe('data retention policies', () => {
    it('renders for Copilot for CLI and Copilot for dotcom', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          copilot_for_dotcom: {
            configurable: true,
            visible: true,
          },
          cli: {
            configurable: true,
          },
        }),
      })
      const footnotes = screen.getByTestId('cb-policies-footnotes')
      expect(footnotes).toHaveTextContent(
        /Enabling Copilot in the CLI, Copilot in github.com and Copilot Chat in GitHub Mobile will collect additional data and updated Product Terms apply. If beta features are enabled, you agree to pre-release terms/,
      )
    })

    it('renders for Copilot for CLI, Copilot for dotcom and Copilot Chat in Mobile', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          copilot_for_dotcom: {
            configurable: true,
            visible: true,
          },
          cli: {
            configurable: true,
          },
        }),
      })
      const footnotes = screen.getByTestId('cb-policies-footnotes')
      expect(footnotes).toHaveTextContent(
        /Enabling Copilot in the CLI, Copilot in github.com and Copilot Chat in GitHub Mobile will collect additional data and updated Product Terms apply. If beta features are enabled, you agree to pre-release terms/,
      )
    })

    it('does not render when on Copilot Enterprise plan', () => {
      render(<Policies />, {
        routePayload: makePoliciesRoutePayload({
          copilot_for_dotcom: {
            configurable: true,
            visible: true,
          },
          cli: {
            configurable: true,
          },
          copilot_plan: 'enterprise',
        }),
      })
      const footnotes = screen.getByTestId('cb-policies-footnotes')
      expect(footnotes).not.toHaveTextContent(
        /Enabling Copilot in the CLI, Copilot in github.com and Copilot Chat in GitHub Mobile will collect additional data and updated Product Terms apply. If beta features are enabled, you agree to pre-release terms/,
      )
      expect(footnotes).toHaveTextContent(/If beta features are enabled, you agree to pre-release terms/)
    })
  })
})

describe('Bing for Copilot settings cascade from business to organization', () => {
  it('when Bing is configured for the business as enabled it cannot be configured for the org and displays as enabled', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        bing_github_chat: {
          configurable: false,
          visible: true,
          enabled: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
            {
              id: 'disabled_option',
              title: 'disabled',
              description: 'disabled',
              value: 'disabled',
              selected: false,
            },
          ],
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot access to Bing')).toBeInTheDocument()

    const bingLockStatus = screen.getByTestId('cfb-policies-bing-feature-locked')
    expect(bingLockStatus).toHaveTextContent('enabled')
  })

  it('when Bing is configured for the business as disabled it cannot be configured for the org and displays as disabled', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        bing_github_chat: {
          configurable: false,
          visible: true,
          enabled: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: false,
            },
            {
              id: 'disabled_option',
              title: 'disabled',
              description: 'disabled',
              value: 'disabled',
              selected: true,
            },
          ],
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot access to Bing')).toBeInTheDocument()

    const bingLockStatus = screen.getByTestId('cfb-policies-bing-feature-locked')
    expect(bingLockStatus).toHaveTextContent('disabled')
  })

  it('when Bing has no policy for the business it can be configured for the org', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        bing_github_chat: {
          configurable: true,
          visible: true,
          enabled: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot access to Bing')).toBeInTheDocument()

    const actionMenu = screen.getByTestId('cfb-policies-bing-feature-button')
    expect(actionMenu).toBeInTheDocument()
  })
})

describe('when Copilot for dotcom and user feedback are enabled by the business', () => {
  it('shows the feedback setting with a disabled checked checkbox', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: false,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        bing_github_chat: {
          configurable: false,
          visible: true,
          enabled: true,
        },
        copilot_user_feedback_opt_in: {
          configurable: false,
          visible: true,
          enabled: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.getByText(/Opt in to user feedback collection/i)).toBeInTheDocument()

    const feedbackCheckbox = screen.getByTestId('cfb-policies-feedback-checkbox')
    expect(feedbackCheckbox).toBeDisabled()
    expect(feedbackCheckbox).toBeChecked()
  })
})

describe('when Copilot for dotcom is enabled and feedback is disabled by the business', () => {
  it('shows the feedback setting with a disabled unchecked checkbox', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: false,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        bing_github_chat: {
          configurable: false,
          visible: true,
          enabled: false,
        },
        copilot_user_feedback_opt_in: {
          configurable: false,
          visible: true,
          enabled: false,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.getByText(/Opt in to user feedback collection/i)).toBeInTheDocument()

    const feedbackCheckbox = screen.getByTestId('cfb-policies-feedback-checkbox')
    expect(feedbackCheckbox).toBeDisabled()
    expect(feedbackCheckbox).not.toBeChecked()
  })
})

describe('when Copilot for dotcom and feedback are enabled by the org', () => {
  it('shows the feedback setting with an enabled checked checkbox', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: true,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        bing_github_chat: {
          configurable: true,
          visible: true,
          enabled: true,
        },
        copilot_user_feedback_opt_in: {
          configurable: true,
          visible: true,
          enabled: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.getByText(/Opt in to user feedback collection/i)).toBeInTheDocument()

    const feedbackCheckbox = screen.getByTestId('cfb-policies-feedback-checkbox')
    expect(feedbackCheckbox).not.toBeDisabled()
    expect(feedbackCheckbox).toBeChecked()
  })
})

describe('when Copilot for dotcom is enabled and feedback is disabled by the org', () => {
  it('shows the feedback setting with an enabled unchecked checkbox', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: true,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        bing_github_chat: {
          configurable: true,
          visible: true,
          enabled: false,
        },
        copilot_user_feedback_opt_in: {
          configurable: true,
          visible: true,
          enabled: false,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.getByText(/Opt in to user feedback collection/i)).toBeInTheDocument()

    const feedbackCheckbox = screen.getByTestId('cfb-policies-feedback-checkbox')
    expect(feedbackCheckbox).not.toBeDisabled()
    expect(feedbackCheckbox).not.toBeChecked()
  })
})

describe('when Copilot for dotcom is disabled', () => {
  it('does not show the feedback setting', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: true,
          visible: true,
          options: [
            {
              id: 'disabled_option',
              title: 'disabled',
              description: 'disabled',
              value: 'disabled',
              selected: true,
            },
          ],
        },
        copilot_user_feedback_opt_in: {
          configurable: false,
          visible: true,
          enabled: false,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.queryByText(/Opt in to user feedback collection/i)).not.toBeInTheDocument()
    expect(screen.queryByTestId('cfb-policies-feedback-checkbox')).not.toBeInTheDocument()
  })
})

describe('when Copilot for dotcom and beta features are enabled by the business', () => {
  it('shows the beta features setting with a disabled checked checkbox', () => {
    mockIsFeatureEnabled.mockReturnValue(true)

    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: false,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        copilot_user_feedback_opt_in: {
          configurable: false,
          visible: false,
          enabled: true,
        },
        copilot_beta_features_opt_in: {
          configurable: false,
          visible: true,
          enabled: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.getByText(/Opt in to preview features/i)).toBeInTheDocument()

    const betaFeaturesCheckbox = screen.getByTestId('cfb-policies-beta-features-checkbox')
    expect(betaFeaturesCheckbox).toBeDisabled()
    expect(betaFeaturesCheckbox).toBeChecked()
  })

  it('hide the beta features setting with feature flag disabled', () => {
    mockIsFeatureEnabled.mockReturnValue(false)

    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: false,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        copilot_user_feedback_opt_in: {
          configurable: false,
          visible: false,
          enabled: true,
        },
        copilot_beta_features_opt_in: {
          configurable: false,
          visible: true,
          enabled: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.queryByText(/Opt in to preview features/i)).not.toBeInTheDocument()

    const betaFeaturesCheckbox = screen.queryByTestId('cfb-policies-beta-features-checkbox')
    expect(betaFeaturesCheckbox).not.toBeInTheDocument()
  })
})

describe('when Copilot for dotcom is enabled and beta features is disabled by the business', () => {
  it('shows the beta features setting with a disabled unchecked checkbox', () => {
    mockIsFeatureEnabled.mockReturnValue(true)

    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: false,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        copilot_user_feedback_opt_in: {
          configurable: false,
          visible: false,
          enabled: false,
        },
        copilot_beta_features_opt_in: {
          configurable: false,
          visible: true,
          enabled: false,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.getByText(/Opt in to preview features/i)).toBeInTheDocument()

    const betaFeaturesCheckbox = screen.getByTestId('cfb-policies-beta-features-checkbox')
    expect(betaFeaturesCheckbox).toBeDisabled()
    expect(betaFeaturesCheckbox).not.toBeChecked()
  })
})

describe('when Copilot for dotcom and beta features are enabled by the org', () => {
  it('shows the beta features setting with an enabled checked checkbox', () => {
    mockIsFeatureEnabled.mockReturnValue(true)

    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: true,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        copilot_user_feedback_opt_in: {
          configurable: true,
          visible: false,
          enabled: true,
        },
        copilot_beta_features_opt_in: {
          configurable: true,
          visible: true,
          enabled: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.getByText(/Opt in to preview features/i)).toBeInTheDocument()

    const betaFeaturesCheckbox = screen.getByTestId('cfb-policies-beta-features-checkbox')
    expect(betaFeaturesCheckbox).not.toBeDisabled()
    expect(betaFeaturesCheckbox).toBeChecked()
  })
})

describe('when Copilot for dotcom is enabled and beta features is disabled by the org', () => {
  it('shows the beta features setting with an enabled unchecked checkbox', () => {
    mockIsFeatureEnabled.mockReturnValue(true)

    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_for_dotcom: {
          configurable: true,
          visible: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
        },
        copilot_user_feedback_opt_in: {
          configurable: true,
          visible: false,
          enabled: false,
        },
        copilot_beta_features_opt_in: {
          configurable: true,
          visible: true,
          enabled: false,
        },
      }),
      appPayload: makeFeatureFlags({copilot_for_enterprise: true}),
    })

    expect(screen.getByText('Copilot in github.com')).toBeInTheDocument()
    expect(screen.getByText(/Opt in to preview features/i)).toBeInTheDocument()

    const betaFeaturesCheckbox = screen.getByTestId('cfb-policies-beta-features-checkbox')
    expect(betaFeaturesCheckbox).not.toBeDisabled()
    expect(betaFeaturesCheckbox).not.toBeChecked()
  })
})

describe('copilot usage metrics policy', () => {
  it('renders nothing if the feature flag is disabled', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload(),
      appPayload: makeFeatureFlags({copilot_usage_metrics_policy: false}),
    })

    expect(screen.queryByTestId('cfb-policies-copilot-usage-metrics-feature')).not.toBeInTheDocument()
  })

  it('renders the component if the flag is enabled', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_usage_metrics_policy: {
          configurable: false,
          options: [],
          visible: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_usage_metrics_policy: true}),
    })

    expect(screen.getByTestId('cfb-policies-copilot-usage-metrics-feature')).toBeInTheDocument()
  })

  it('does not allow admin to change policy when unconfigurable', () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_usage_metrics_policy: {
          configurable: false,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
          visible: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_usage_metrics_policy: true}),
    })

    const lockStatus = screen.getByTestId('cfb-policies-copilot-usage-metrics-feature-locked')
    expect(screen.queryByTestId('cfb-policies-copilot-usage-metrics-control')).not.toBeInTheDocument()
    expect(lockStatus).toHaveTextContent('enabled')
  })

  it("displays policy's form control when configurable", () => {
    render(<Policies />, {
      routePayload: makePoliciesRoutePayload({
        copilot_usage_metrics_policy: {
          configurable: true,
          options: [
            {
              id: 'enabled_option',
              title: 'enabled',
              description: 'enabled',
              value: 'enabled',
              selected: true,
            },
          ],
          visible: true,
        },
      }),
      appPayload: makeFeatureFlags({copilot_usage_metrics_policy: true}),
    })

    const formControl = screen.getByTestId('cfb-policies-copilot-usage-metrics-control')

    expect(formControl).toBeInTheDocument()
    expect(screen.queryByTestId('cfb-policies-copilot-usage-metrics-feature-locked')).not.toBeInTheDocument()
    expect(within(formControl).getByRole('button')).not.toBeDisabled()
    expect(formControl).toHaveTextContent(/enabled/)
  })
})

describe('options change', () => {
  it('can switch', async () => {
    render(<Policies />, {routePayload: makePoliciesRoutePayload(), appPayload: makeFeatureFlags()})

    fireEvent.click(screen.getByRole('button', {name: /option 2 editor_chat/}))

    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitemradio', {name: 'option 1 editor_chat'}))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await screen.findByRole('button', {name: /option 1 editor_chat/})
  })

  it('shows a toast if something fails', async () => {
    useCopilotSettingsMutationCommit.mockImplementationOnce(({onError}) => {
      onError(new Error('Test error'))
    })

    render(<Policies />, {routePayload: makePoliciesRoutePayload(), appPayload: makeFeatureFlags()})

    fireEvent.click(screen.getByRole('button', {name: /option 2 editor_chat/}))

    expect(screen.getByRole('menu')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('menuitemradio', {name: 'option 1 editor_chat'}))

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()

    await screen.findByTestId('ui-app-toast-error')

    expect(screen.getByTestId('ui-app-toast-error')).toHaveTextContent(/Test error/)
  })
})

// --

function makeFeatureFlags(flags: Record<string, boolean> = {}) {
  return {
    enabled_features: {
      ...flags,
    },
  }
}
