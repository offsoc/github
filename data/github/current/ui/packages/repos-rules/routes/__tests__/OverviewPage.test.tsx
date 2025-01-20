import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

import {OverviewPage} from '../OverviewPage'
import {homeRoutePayload, mockRuleset} from '../../state/__tests__/helpers'
import type {HomeRoutePayload} from '../../types/rules-types'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'

jest.mock('@github-ui/react-core/use-feature-flag')
const mockUseFeatureFlag = jest.mocked(useFeatureFlag)

describe('OverviewPage', () => {
  beforeEach(() => {
    mockUseFeatureFlag.mockReturnValue(true)
  })

  test('should render a blankslate given a no-ruleset payload', () => {
    render(<OverviewPage />, {
      pathname: '/github/github/settings/rules',
      routePayload: {
        ...homeRoutePayload,
        rulesets: [],
      },
    })

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText("You haven't created any rulesets")).toBeInTheDocument()
  })

  test('should render a blankslate with search verbiage given a ruleset-full payload with no search results', () => {
    render(<OverviewPage />, {
      pathname: '/github/github/settings/rules',
      routePayload: {
        ...homeRoutePayload,
        branch: 'main',
        matchingRulesets: [],
      },
    })

    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByText('No rulesets matched your search')).toBeInTheDocument()
    expect(screen.getByText('Try expanding your search or creating a new ruleset')).toBeInTheDocument()
  })

  test('should render given a standard single-ruleset payload', () => {
    render(<OverviewPage />, {
      pathname: '/github/github/settings/rules',
      routePayload: homeRoutePayload,
    })

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  test('should render given all rulesets if no filter applied', () => {
    const routePayload = {
      ...homeRoutePayload,
      rulesets: [
        {
          ...mockRuleset,
          id: 1,
          name: 'Fancy Ruleset 1',
        },
        {
          ...mockRuleset,
          id: 2,
          target: 'tag',
          name: 'Fancy Ruleset 2',
        },
      ],
    }

    render(<OverviewPage />, {
      pathname: '/github/github/settings/rules',
      routePayload,
    })

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  test('should render rulesets grouped by org and repo if rulesets are spread between them', () => {
    const routePayload: HomeRoutePayload = {
      ...homeRoutePayload,
      rulesets: [
        {
          ...mockRuleset,
          id: 1,
          name: 'Fancy Ruleset 1',
          source: {
            id: 1,
            type: 'Organization',
            name: 'neat-org',
            url: '/github',
          },
        },
        {
          ...mockRuleset,
          id: 2,
          target: 'tag',
          name: 'Fancy Ruleset 2',
        },
      ],
    }

    render(<OverviewPage />, {
      pathname: '/github/github/settings/rules',
      routePayload,
    })

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('Organization rulesets')).toBeInTheDocument()
    expect(screen.getByText('Repository rulesets')).toBeInTheDocument()
    expect(screen.getByText('Managed by neat-org')).toBeInTheDocument()
  })

  test('should render only rulesets in matchingRulesets if a branch prop is given', () => {
    const routePayload: HomeRoutePayload = {
      ...homeRoutePayload,
      branch: 'main',
      matchingRulesets: [1],
      rulesets: [
        {
          ...mockRuleset,
          id: 1,
          name: 'Fancy Ruleset 1',
        },
        {
          ...mockRuleset,
          id: 2,
          target: 'tag',
          name: 'Fancy Ruleset 2',
        },
      ],
    }

    render(<OverviewPage />, {
      pathname: '/github/github/settings/rules',
      routePayload,
    })

    expect(screen.getAllByRole('listitem')).toHaveLength(1)
    expect(screen.getByRole('listitem')).toHaveTextContent('Fancy Ruleset 1')
  })
})
