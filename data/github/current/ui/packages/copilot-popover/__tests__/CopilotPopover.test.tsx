import {expectAnalyticsEvents} from '@github-ui/analytics-test-utils'
import {type Repository, useCurrentRepository} from '@github-ui/current-repository'
import {render} from '@github-ui/react-core/test-utils'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {fireEvent, screen} from '@testing-library/react'

import {useCurrentUser} from '@github-ui/current-user'
import {CopilotPopover} from '../CopilotPopover'
import type {CopilotAccessInfo, CopilotInfo} from '@github-ui/copilot-common-types'
import {testCopilotAccessInfo, testCopilotInfo} from '../test-utils/mock-data'

jest.mock('@github-ui/react-core/use-feature-flag')
const mockUseFeatureFlag = jest.mocked(useFeatureFlag)

jest.mock('@github-ui/current-repository')
const mockedUseCurrentRepository = jest.mocked(useCurrentRepository)

jest.mock('@github-ui/current-user')
const mockedUseCurrentUser = jest.mocked(useCurrentUser)

describe('CopilotPopover', () => {
  beforeEach(() => {
    mockUseFeatureFlag.mockReturnValue(true)
    mockedUseCurrentUser.mockReturnValue({id: 1234, login: 'mona', userEmail: 'monalisa@github.com'})
    mockedUseCurrentRepository.mockReturnValue({id: 100, isOrgOwned: false, ownerLogin: 'mona'} as Repository)
  })

  test('show popover when accessAllowed is not set', () => {
    const copilotInfo: CopilotInfo = {
      ...testCopilotInfo,
      userAccess: {
        ...testCopilotAccessInfo,
        accessAllowed: undefined,
      },
    }

    render(<CopilotPopover copilotInfo={copilotInfo} view={'blame'} />)

    const button = screen.queryByTestId('copilot-popover-button')
    expect(button).toBeInTheDocument()
  })

  test('hide if copilotInfo is undefined', () => {
    render(<CopilotPopover copilotInfo={undefined} view={'blame'} />)

    const button = screen.queryByTestId('copilot-popover-button')
    expect(button).not.toBeInTheDocument()
  })

  test('hide popover upon dismissal', () => {
    const copilotAccessInfo: CopilotAccessInfo = {...testCopilotAccessInfo, business: undefined}

    const copilotInfo: CopilotInfo = {
      ...testCopilotInfo,
      userAccess: copilotAccessInfo,
      notices: {
        ...testCopilotInfo.notices,
        codeViewPopover: {
          ...testCopilotInfo.notices.codeViewPopover!,
          dismissed: false,
        },
      },
    }

    render(<CopilotPopover copilotInfo={copilotInfo} view={'preview'} />)

    const button = screen.getByTestId('copilot-popover-button')
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    const dismissButton = screen.getByTestId('copilot-popover-dismiss-button')

    fireEvent.click(dismissButton)

    const noButton = screen.queryByTestId('copilot-popover-button')
    expect(noButton).not.toBeInTheDocument()

    expectAnalyticsEvents(
      {
        type: 'analytics.click',
        data: {
          category: 'copilot_popover_code_view',
          action: `click_to_open_popover_preview`,
          label: `ref_cta:open_copilot_popover;owner:mona;relationship:owner`,
        },
      },
      {
        type: 'analytics.click',
        data: {
          category: 'copilot_popover_code_view',
          action: `click_to_dismiss_copilot_popover_forever`,
          label: `ref_cta:dont_show_again;ref_loc:code_view_preview`,
        },
      },
    )
  })

  describe('personal account repo', () => {
    beforeEach(() => {
      mockedUseCurrentRepository.mockReturnValue({id: 100, isOrgOwned: false, ownerLogin: 'mona'} as Repository)
    })

    test('when user has no Copilot access and is a part of one or more orgs', () => {
      const copilotAccessInfo: CopilotAccessInfo = {
        ...testCopilotAccessInfo,
        userHasCFIAccess: false,
        userHasOrgs: true,
        business: undefined,
      }

      const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

      render(<CopilotPopover copilotInfo={copilotInfo} view={'blame'} />)

      const button = screen.getByTestId('copilot-popover-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Code 55% faster with GitHub Copilot')

      fireEvent.click(button)

      const popoverContent = screen.getByTestId('copilot-popover-content')
      expect(popoverContent).toBeInTheDocument()
      expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
      expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
        'Spend less time creating boilerplate and repetitive code patterns,',
      )

      const popoverCTA = screen.getByRole('link', {name: 'Get GitHub Copilot'})
      expect(popoverCTA).toHaveAttribute('href', '/settings/copilot')
      fireEvent.click(popoverCTA)

      const learnMoreLink = screen.getByTestId('copilot-popover-content-learn-more')
      expect(learnMoreLink).toHaveAttribute('href', 'https://www.github.com/copilot_documentation_url')
      fireEvent.click(learnMoreLink)

      expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

      expectAnalyticsEvents(
        {
          type: 'analytics.click',
          data: {
            category: 'copilot_popover_code_view',
            action: `click_to_open_popover_blame`,
            label: `ref_cta:open_copilot_popover;owner:mona;relationship:owner`,
          },
        },
        {
          type: 'analytics.click',
          data: {
            category: 'copilot_popover_code_view',
            action: `click_to_go_to_copilot_settings`,
            label: `ref_cta:get_github_copilot;ref_loc:code_view_blame`,
          },
        },
        {
          type: 'analytics.click',
          data: {
            category: 'copilot_popover_code_view',
            action: 'click_to_go_to_copilot_for_business_info',
            label: 'ref_cta:learn_more;ref_loc:code_view',
          },
        },
      )
    })

    test('when user has no Copilot access and has no orgs', () => {
      const copilotAccessInfo: CopilotAccessInfo = {
        ...testCopilotAccessInfo,
        userHasCFIAccess: false,
        userHasOrgs: false,
        business: undefined,
      }

      const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

      render(<CopilotPopover copilotInfo={copilotInfo} view={'preview'} />)

      const button = screen.getByTestId('copilot-popover-button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Code 55% faster with GitHub Copilot')

      fireEvent.click(button)

      const popoverContent = screen.getByTestId('copilot-popover-content')
      expect(popoverContent).toBeInTheDocument()
      expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
      expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
        'Spend less time creating boilerplate and repetitive code patterns,',
      )

      const popoverCTA = screen.getByRole('link', {name: 'Start a free trial'})
      expect(popoverCTA).toHaveAttribute('href', '/github-copilot/signup')
      fireEvent.click(popoverCTA)

      expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

      expectAnalyticsEvents(
        {
          type: 'analytics.click',
          data: {
            category: 'copilot_popover_code_view',
            action: `click_to_open_popover_preview`,
            label: `ref_cta:open_copilot_popover;owner:mona;relationship:owner`,
          },
        },
        {
          type: 'analytics.click',
          data: {
            category: 'copilot_popover_code_view',
            action: `click_to_go_to_copilot_trial_signup`,
            label: `ref_cta:start_a_free_trial;ref_loc:code_view_preview`,
          },
        },
      )
    })
  })

  describe('organization-owned repo', () => {
    beforeEach(() => {
      mockedUseCurrentRepository.mockReturnValue({id: 101, isOrgOwned: true, ownerLogin: 'cool-org-name'} as Repository)
    })

    test('upon dismissal', () => {
      const copilotAccessInfo: CopilotAccessInfo = {
        ...testCopilotAccessInfo,
        orgHasCFBAccess: false,
        userIsOrgAdmin: true,
        userIsOrgMember: true,
        business: undefined,
      }

      const copilotInfo: CopilotInfo = {
        ...testCopilotInfo,
        userAccess: copilotAccessInfo,
        notices: {
          ...testCopilotInfo.notices,
          codeViewPopover: {
            ...testCopilotInfo.notices.codeViewPopover!,
            dismissed: false,
          },
        },
      }

      render(<CopilotPopover copilotInfo={copilotInfo} view={'preview'} />)

      const button = screen.getByTestId('copilot-popover-button')
      expect(button).toBeInTheDocument()

      fireEvent.click(button)

      const dismissButton = screen.getByTestId('copilot-popover-dismiss-button')

      fireEvent.click(dismissButton)

      const noButton = screen.queryByTestId('copilot-popover-button')
      expect(noButton).not.toBeInTheDocument()

      expectAnalyticsEvents(
        {
          type: 'analytics.click',
          data: {
            category: 'copilot_popover_code_view',
            action: `click_to_open_popover_preview`,
            label: `ref_cta:open_copilot_popover;owner:cool-org-name;relationship:admin`,
          },
        },
        {
          type: 'analytics.click',
          data: {
            category: 'copilot_popover_code_view',
            action: `click_to_dismiss_copilot_popover_forever`,
            label: `ref_cta:dont_show_again;ref_loc:org_code_view_preview_org_admin`,
          },
        },
      )
    })

    describe('when user is non-org member and has no Copilot access', () => {
      test('when user has no orgs', () => {
        const copilotAccessInfo: CopilotAccessInfo = {
          ...testCopilotAccessInfo,
          userHasCFIAccess: false,
          userHasOrgs: false,
          userIsOrgMember: false,
          business: undefined,
        }

        const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

        render(<CopilotPopover copilotInfo={copilotInfo} view={'edit'} />)

        const button = screen.getByTestId('copilot-popover-button')
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent('Code 55% faster with GitHub Copilot')

        fireEvent.click(button)

        expect(screen.getByTestId('copilot-popover-content')).toBeInTheDocument()
        expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
        expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
          'Spend less time creating boilerplate and repetitive code patterns,',
        )

        const popoverCTA = screen.getByRole('link', {name: 'Start a free trial'})
        expect(popoverCTA).toHaveAttribute('href', '/github-copilot/signup')
        fireEvent.click(popoverCTA)

        expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

        expectAnalyticsEvents(
          {
            type: 'analytics.click',
            data: {
              category: 'copilot_popover_code_view',
              action: `click_to_open_popover_edit`,
              label: `ref_cta:open_copilot_popover;owner:cool-org-name;relationship:personal`,
            },
          },
          {
            type: 'analytics.click',
            data: {
              category: 'copilot_popover_code_view',
              action: `click_to_go_to_copilot_trial_signup`,
              label: `ref_cta:start_a_free_trial;ref_loc:code_view_edit`,
            },
          },
        )
      })

      test('when user is a part of one or more orgs', () => {
        const copilotAccessInfo: CopilotAccessInfo = {
          ...testCopilotAccessInfo,
          userHasCFIAccess: false,
          userHasOrgs: true,
          userIsOrgMember: false,
          business: undefined,
        }

        const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

        render(<CopilotPopover copilotInfo={copilotInfo} view={'edit'} />)

        const button = screen.getByTestId('copilot-popover-button')
        expect(button).toBeInTheDocument()
        expect(button).toHaveTextContent('Code 55% faster with GitHub Copilot')

        fireEvent.click(button)

        expect(screen.getByTestId('copilot-popover-content')).toBeInTheDocument()
        expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
        expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
          'Spend less time creating boilerplate and repetitive code patterns,',
        )

        const popoverCTA = screen.getByRole('link', {name: 'Get GitHub Copilot'})
        expect(popoverCTA).toHaveAttribute('href', '/settings/copilot')
        fireEvent.click(popoverCTA)

        expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

        expectAnalyticsEvents(
          {
            type: 'analytics.click',
            data: {
              category: 'copilot_popover_code_view',
              action: `click_to_open_popover_edit`,
              label: `ref_cta:open_copilot_popover;owner:cool-org-name;relationship:personal`,
            },
          },
          {
            type: 'analytics.click',
            data: {
              category: 'copilot_popover_code_view',
              action: `click_to_go_to_copilot_settings`,
              label: `ref_cta:get_github_copilot;ref_loc:code_view_edit`,
            },
          },
        )
      })
    })

    describe('when user is org member/admin/owner', () => {
      describe('org has not adopted Copilot for Business', () => {
        test('when current user is an org owner', () => {
          const copilotAccessInfo: CopilotAccessInfo = {
            ...testCopilotAccessInfo,
            orgHasCFBAccess: false,
            userIsOrgAdmin: true,
            userIsOrgMember: true,
            business: undefined,
          }
          mockedUseCurrentRepository.mockReturnValue({id: 101, isOrgOwned: true, ownerLogin: 'mona'} as Repository)

          const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

          render(<CopilotPopover copilotInfo={copilotInfo} view={'preview'} />)

          const button = screen.getByTestId('copilot-popover-button')
          expect(button).toBeInTheDocument()
          expect(button).toHaveTextContent('Code 55% faster with GitHub Copilot')

          fireEvent.click(button)

          expect(screen.getByTestId('copilot-popover-content')).toBeInTheDocument()
          expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
          expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
            'For an organization, developers writing less boilerplate code means',
          )
          const popoverCTA = screen.getByRole('link', {name: 'Get GitHub Copilot'})
          expect(popoverCTA).toHaveAttribute(
            'href',
            `/github-copilot/business_signup/organization/payment?org=${mockedUseCurrentRepository().ownerLogin}`,
          )
          fireEvent.click(popoverCTA)

          expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

          expectAnalyticsEvents(
            {
              type: 'analytics.click',
              data: {
                category: 'copilot_popover_code_view',
                action: `click_to_open_popover_preview`,
                label: `ref_cta:open_copilot_popover;owner:mona;relationship:owner`,
              },
            },
            {
              type: 'analytics.click',
              data: {
                category: 'copilot_popover_code_view',
                action: `click_to_buy_copilot_for_business`,
                label: `ref_cta:get_github_copilot;ref_loc:code_view_preview`,
              },
            },
          )
        })

        test('when current user is an org admin', () => {
          const copilotAccessInfo: CopilotAccessInfo = {
            ...testCopilotAccessInfo,
            orgHasCFBAccess: false,
            userIsOrgAdmin: true,
            userIsOrgMember: true,
            business: undefined,
          }

          const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

          render(<CopilotPopover copilotInfo={copilotInfo} view={'preview'} />)

          const button = screen.getByTestId('copilot-popover-button')
          expect(button).toBeInTheDocument()
          expect(button).toHaveTextContent('Code 55% faster with GitHub Copilot')

          fireEvent.click(button)

          expect(screen.getByTestId('copilot-popover-content')).toBeInTheDocument()
          expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
          expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
            'For an organization, developers writing less boilerplate code means',
          )
          const popoverCTA = screen.getByRole('link', {name: 'Get GitHub Copilot'})
          expect(popoverCTA).toHaveAttribute(
            'href',
            `/github-copilot/business_signup/organization/payment?org=${mockedUseCurrentRepository().ownerLogin}`,
          )
          fireEvent.click(popoverCTA)

          expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

          expectAnalyticsEvents(
            {
              type: 'analytics.click',
              data: {
                category: 'copilot_popover_code_view',
                action: `click_to_open_popover_preview`,
                label: `ref_cta:open_copilot_popover;owner:cool-org-name;relationship:admin`,
              },
            },
            {
              type: 'analytics.click',
              data: {
                category: 'copilot_popover_code_view',
                action: `click_to_buy_copilot_for_business`,
                label: `ref_cta:get_github_copilot;ref_loc:code_view_preview`,
              },
            },
          )
        })

        test('when user is org member and has CfI', () => {
          const copilotAccessInfo: CopilotAccessInfo = {
            ...testCopilotAccessInfo,
            userHasCFIAccess: true,
            userIsOrgAdmin: false,
            userIsOrgMember: true,
            orgHasCFBAccess: false,
            business: undefined,
          }

          const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

          render(<CopilotPopover copilotInfo={copilotInfo} view={'edit'} />)

          const button = screen.getByTestId('copilot-popover-button')
          expect(button).toBeInTheDocument()
          expect(button).toHaveTextContent('Your organization can pay for GitHub Copilot')

          fireEvent.click(button)

          expect(screen.getByTestId('copilot-popover-content')).toBeInTheDocument()
          expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
          expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
            "We noticed that you're personally paying for GitHub Copilot. Instead",
          )
          const popoverCTA = screen.getByRole('button', {name: 'Ask admin for access'})
          expect(popoverCTA).toBeInTheDocument()
          fireEvent.click(popoverCTA)

          expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

          expectAnalyticsEvents(
            {
              type: 'analytics.click',
              data: {
                category: 'copilot_popover_code_view',
                action: `click_to_open_popover_edit`,
                label: `ref_cta:open_copilot_popover;owner:cool-org-name;relationship:member`,
              },
            },
            {
              type: 'analytics.click',
              data: {
                category: 'member_feature_request',
                action: `action.copilot_for_business`,
                label: `ref_cta:ask_admin_for_access;ref_loc:copilot_for_business;`,
              },
            },
          )
        })

        test('when user is org member and has CfB from another org', () => {
          const copilotAccessInfo: CopilotAccessInfo = {
            ...testCopilotAccessInfo,
            orgHasCFBAccess: false,
            userHasCFIAccess: false,
            userIsOrgAdmin: false,
            userIsOrgMember: true,
            business: {
              ...testCopilotAccessInfo.business!,
              name: 'NOT-same-cfb-organization',
            },
          }

          const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

          render(<CopilotPopover copilotInfo={copilotInfo} view={'edit'} />)

          const button = screen.getByTestId('copilot-popover-button')
          expect(button).toBeInTheDocument()
          expect(button).toHaveTextContent('Your organization can pay for GitHub Copilot')

          fireEvent.click(button)

          expect(screen.getByTestId('copilot-popover-content')).toBeInTheDocument()
          expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
          expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
            'Spend less time creating boilerplate and repetitive code patterns,',
          )

          const popoverCTA = screen.getByRole('button', {name: 'Ask admin for access'})
          expect(popoverCTA).toBeInTheDocument()
          fireEvent.click(popoverCTA)

          expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

          expectAnalyticsEvents(
            {
              type: 'analytics.click',
              data: {
                category: 'copilot_popover_code_view',
                action: `click_to_open_popover_edit`,
                label: `ref_cta:open_copilot_popover;owner:cool-org-name;relationship:member`,
              },
            },
            {
              type: 'analytics.click',
              data: {
                category: 'member_feature_request',
                action: `action.copilot_for_business`,
                label: `ref_cta:ask_admin_for_access;ref_loc:copilot_for_business;`,
              },
            },
          )
        })

        test('when user is org member and has no Copilot access', () => {
          const copilotAccessInfo: CopilotAccessInfo = {
            ...testCopilotAccessInfo,
            orgHasCFBAccess: false,
            userHasCFIAccess: false,
            userIsOrgAdmin: false,
            userIsOrgMember: true,
            business: undefined,
          }

          const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

          render(<CopilotPopover copilotInfo={copilotInfo} view={'preview'} />)

          const button = screen.getByTestId('copilot-popover-button')
          expect(button).toBeInTheDocument()
          expect(button).toHaveTextContent('Your organization can pay for GitHub Copilot')

          fireEvent.click(button)

          expect(screen.getByTestId('copilot-popover-content')).toBeInTheDocument()
          expect(screen.getByRole('heading')).toHaveTextContent('Code 55% faster with GitHub Copilot')
          expect(screen.getByTestId('copilot-popover-body-text')).toHaveTextContent(
            'Spend less time creating boilerplate and repetitive code patterns,',
          )
          const popoverCTA = screen.getByRole('button', {name: 'Ask admin for access'})
          expect(popoverCTA).toBeInTheDocument()
          fireEvent.click(popoverCTA)

          expect(screen.getByTestId('copilot-popover-dismiss-button')).toBeInTheDocument()

          expectAnalyticsEvents(
            {
              type: 'analytics.click',
              data: {
                category: 'copilot_popover_code_view',
                action: `click_to_open_popover_preview`,
                label: `ref_cta:open_copilot_popover;owner:cool-org-name;relationship:member`,
              },
            },
            {
              type: 'analytics.click',
              data: {
                category: 'member_feature_request',
                action: `action.copilot_for_business`,
                label: `ref_cta:ask_admin_for_access;ref_loc:copilot_for_business;`,
              },
            },
          )
        })
      })

      describe('ask admin for access', () => {
        test('show when showFeatureRequest is true', () => {
          const copilotAccessInfo: CopilotAccessInfo = {
            ...testCopilotAccessInfo,
            orgHasCFBAccess: false,
            userHasCFIAccess: false,
            userIsOrgAdmin: false,
            userIsOrgMember: true,
            business: undefined,
          }

          const copilotInfo: CopilotInfo = {...testCopilotInfo, userAccess: copilotAccessInfo}

          render(<CopilotPopover copilotInfo={copilotInfo} view={'preview'} />)

          const popoverButton = screen.getByTestId('copilot-popover-button')
          fireEvent.click(popoverButton)

          const button = screen.queryByTestId('feature-request-request-button')
          expect(button).toBeInTheDocument()
        })
      })
    })
  })
})
