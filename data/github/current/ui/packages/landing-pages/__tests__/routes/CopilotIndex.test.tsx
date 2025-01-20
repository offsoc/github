import {render} from '@github-ui/react-core/test-utils'
import {CopilotIndex} from '../../routes/CopilotIndex'
import {act, screen} from '@testing-library/react'
import featuresCopilotPagePayload from '../fixtures/routes/FeaturesCopilotPage/indexPagePayload'
import {fetchVariant} from '../../utils'

// Mock the fetchVariant function
jest.mock('../../utils', () => ({
  fetchVariant: jest.fn(),
}))

describe('CopilotIndex', () => {
  it('renders single CTA to /features/copilot/plans when logged out', async () => {
    ;(fetchVariant as jest.Mock).mockResolvedValue('single_btn_copilot_plans')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<CopilotIndex />, {
        routePayload: {
          experimentation_copilot_alt_ctas_enabled: false,
          logged_in: false,
          contentfulRawJsonResponse: featuresCopilotPagePayload.contentfulRawJsonResponse,
        },
      })
    })

    expect(screen.getByTestId('single-btn-copilot-plans')).toBeInTheDocument()
    expect(screen.queryByTestId('dual-btn-copilot-signup')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dual-btn-copilot-plans')).not.toBeInTheDocument()
  })

  it('renders dual CTA variant when logged in with feature flag on', async () => {
    ;(fetchVariant as jest.Mock).mockResolvedValue('dual_variant_copilot_btns')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<CopilotIndex />, {
        routePayload: {
          experimentation_copilot_alt_ctas_enabled: true,
          logged_in: true,
          contentfulRawJsonResponse: featuresCopilotPagePayload.contentfulRawJsonResponse,
        },
      })
    })

    expect(screen.queryByTestId('single-btn-copilot-plans')).not.toBeInTheDocument()
    expect(screen.getByTestId('dual-btn-copilot-signup')).toBeInTheDocument()
    expect(screen.getByTestId('dual-btn-copilot-plans')).toBeInTheDocument()
  })

  it('does not render dual CTA variant when logged in with feature flag off', async () => {
    ;(fetchVariant as jest.Mock).mockResolvedValue('single_btn_copilot_plans')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<CopilotIndex />, {
        routePayload: {
          experimentation_copilot_alt_ctas_enabled: false,
          logged_in: true,
          contentfulRawJsonResponse: featuresCopilotPagePayload.contentfulRawJsonResponse,
        },
      })
    })

    expect(screen.getByTestId('single-btn-copilot-plans')).toBeInTheDocument()
    expect(screen.queryByTestId('dual-btn-copilot-signup')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dual-btn-copilot-plans')).not.toBeInTheDocument()
  })

  it('renders only the single CTA to /features/copilot/plans when user comes from a paid media campaign', async () => {
    ;(fetchVariant as jest.Mock).mockResolvedValue('single_btn_copilot_plans')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<CopilotIndex />, {
        routePayload: {
          is_paid_media_campaign: true,
          experimentation_copilot_alt_ctas_enabled: true,
          logged_in: true,
          contentfulRawJsonResponse: featuresCopilotPagePayload.contentfulRawJsonResponse,
        },
      })
    })

    expect(screen.getByTestId('single-btn-copilot-plans')).toBeInTheDocument()
    expect(screen.queryByTestId('dual-btn-copilot-signup')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dual-btn-copilot-plans')).not.toBeInTheDocument()
  })

  it('renders only the single CTA to /features/copilot/plans when user already has a copilot sub', async () => {
    ;(fetchVariant as jest.Mock).mockResolvedValue('single_btn_copilot_plans')

    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      render(<CopilotIndex />, {
        routePayload: {
          has_copilot_subscription: true,
          experimentation_copilot_alt_ctas_enabled: true,
          logged_in: true,
          contentfulRawJsonResponse: featuresCopilotPagePayload.contentfulRawJsonResponse,
        },
      })
    })

    expect(screen.getByTestId('single-btn-copilot-plans')).toBeInTheDocument()
    expect(screen.queryByTestId('dual-btn-copilot-signup')).not.toBeInTheDocument()
    expect(screen.queryByTestId('dual-btn-copilot-plans')).not.toBeInTheDocument()
  })
})
