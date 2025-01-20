import {act, render, screen, waitFor, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {type Owner, Role} from '../../../../client/api/common-contracts'
import {apiDeleteMemex} from '../../../../client/api/memex/api-delete-memex'
import {apiMemexWithoutLimitsBetaOptout} from '../../../../client/api/memex/api-post-beta-optout'
import {apiResyncElasticsearchIndex} from '../../../../client/api/memex-items/api-resync-elasticsearch-index'
import {CreatedWithTemplateClick, ProjectDescriptionSettingsPageUI} from '../../../../client/api/stats/contracts'
import {overrideDefaultPrivileges} from '../../../../client/helpers/viewer-privileges'
import {usePostStats} from '../../../../client/hooks/common/use-post-stats'
import {useEnabledFeatures} from '../../../../client/hooks/use-enabled-features'
import {GeneralSettingsView} from '../../../../client/pages/settings/components/general-settings-view'
import {ApiError} from '../../../../client/platform/api-error'
import {Resources, SettingsResources} from '../../../../client/strings'
import {draftIssueFactory} from '../../../factories/memex-items/draft-issue-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {redactedItemFactory} from '../../../factories/memex-items/redacted-item-factory'
import {memexFactory} from '../../../factories/memexes/memex-factory'
import {stubRejectedApiResponse, stubResolvedApiResponse} from '../../../mocks/api/memex'
import {mockUseHasColumnData} from '../../../mocks/hooks/use-has-column-data'
import {asMockHook} from '../../../mocks/stub-utilities'
import {createTestEnvironment, TestAppContainer} from '../../../test-app-wrapper'

jest.mock('../../../../client/hooks/use-enabled-features')
jest.mock('../../../../client/hooks/common/use-post-stats')

// Mocking this module to avoid the verified-fetch call and generating
// "Can not make cross-origin requests from verifiedFetch" errors in tests.
// This is because our test suite uses absolute URLs for this endpoint
// and a global `node-fetch` module to mock the `fetch` API complains
// about relative URLs being provided to it.
jest.mock('../../../../client/api/memex/api-delete-memex')
jest.mock('../../../../client/api/memex-items/api-resync-elasticsearch-index')
jest.mock('../../../../client/api/memex/api-post-beta-optout')

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),

  useBlocker: () => {
    return {
      state: 'blocked',
      proceed: jest.fn(),
      reset: jest.fn(),
    }
  },
}))

describe('General Settings View', () => {
  let mockPostStats: jest.Mock

  beforeEach(() => {
    mockUseHasColumnData()

    asMockHook(useEnabledFeatures).mockReturnValue({
      memex_paginated_archive: false,
    })

    mockPostStats = jest.fn()
    asMockHook(usePostStats).mockReturnValue({
      postStats: mockPostStats,
    })
  })

  it('should render a heading for "Project Settings"', () => {
    createTestEnvironment()

    render(
      <TestAppContainer>
        <GeneralSettingsView />
      </TestAppContainer>,
    )

    expect(screen.getByRole('heading', {name: 'Project settings'})).toBeInTheDocument()
  })

  describe('Project Settings', () => {
    it('should allow interaction with the project visibility toggle when the user has sufficient permissions', () => {
      createTestEnvironment({
        'memex-viewer-privileges': overrideDefaultPrivileges({
          role: Role.Admin,
          canChangeProjectVisibility: true,
        }),
      })
      render(
        <TestAppContainer>
          <GeneralSettingsView />
        </TestAppContainer>,
      )

      expect(screen.getByRole('heading', {name: 'Visibility'})).toBeInTheDocument()
      expect(screen.getByText('This project is currently public.')).toBeInTheDocument()
      const visibilityOption = screen.getByTestId('project-visibility-button')
      expect(visibilityOption).toHaveTextContent('Public')
      expect(visibilityOption).toBeEnabled()
      act(() => visibilityOption.click())
      expect(screen.getByText(/Everyone on the internet has read access to this project./)).toBeInTheDocument()
    })

    it('should display "internal" visibility messaging for a "public" project with an enterprise managed owner', () => {
      createTestEnvironment({
        'memex-viewer-privileges': overrideDefaultPrivileges({
          role: Role.Admin,
          canChangeProjectVisibility: true,
        }),
        'memex-owner': {
          id: 1,
          login: 'github',
          name: 'GitHub',
          avatarUrl: 'https://foo.bar/avatar.png',
          type: 'organization',
          isEnterpriseManaged: true,
        },
      })
      render(
        <TestAppContainer>
          <GeneralSettingsView />
        </TestAppContainer>,
      )

      expect(screen.getByRole('heading', {name: 'Visibility'})).toBeInTheDocument()
      expect(screen.getByText('This project is currently internal to your enterprise.')).toBeInTheDocument()
      const visibilityOption = screen.getByTestId('project-visibility-button')
      expect(visibilityOption).toHaveTextContent('Internal')
      expect(visibilityOption).toBeEnabled()
      act(() => visibilityOption.click())
      expect(screen.getByText(/Everyone in your enterprise has read access to this project./)).toBeInTheDocument()
    })

    it('should disallow interaction with the project visibility toggle when the user does not have sufficient permissions', () => {
      createTestEnvironment({
        'memex-viewer-privileges': overrideDefaultPrivileges({
          role: Role.Admin,
          canChangeProjectVisibility: false,
        }),
      })
      render(
        <TestAppContainer>
          <GeneralSettingsView />
        </TestAppContainer>,
      )

      expect(screen.getByRole('heading', {name: 'Visibility'})).toBeInTheDocument()
      expect(screen.getByText('Only admins can change project visibility.')).toBeInTheDocument()
      expect(screen.getByTestId('project-visibility-button')).toBeDisabled()
    })

    it('should display a custom message for an organization-owned project when the visibility toggle is disabled', () => {
      createTestEnvironment({
        'memex-viewer-privileges': overrideDefaultPrivileges({
          role: Role.Admin,
          canChangeProjectVisibility: false,
        }),
        'memex-owner': {
          id: 1,
          login: 'github',
          name: 'GitHub',
          avatarUrl: 'https://foo.bar/avatar.png',
          type: 'organization',
        },
      })
      render(
        <TestAppContainer>
          <GeneralSettingsView />
        </TestAppContainer>,
      )

      expect(screen.getByRole('heading', {name: 'Visibility'})).toBeInTheDocument()
      expect(screen.getByText('Only organization owners can change project visibility.')).toBeInTheDocument()
      expect(screen.getByTestId('project-visibility-button')).toBeDisabled()
    })

    it('has readme section and preview section', () => {
      createTestEnvironment({
        'memex-viewer-privileges': overrideDefaultPrivileges({
          role: Role.Write,
          canChangeProjectVisibility: false,
        }),
      })
      render(
        <TestAppContainer>
          <GeneralSettingsView />
        </TestAppContainer>,
      )

      expect(screen.getByRole('group', {name: 'README'})).toBeInTheDocument()
      expect(within(screen.getByTestId('markdown-editor')).getByRole('textbox')).toBeEnabled()
    })

    it('should render an option to delete a project if user is admin', () => {
      createTestEnvironment({
        'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
      })
      render(
        <TestAppContainer>
          <GeneralSettingsView />
        </TestAppContainer>,
      )

      expect(screen.getByRole('heading', {name: 'Delete project'})).toBeInTheDocument()
    })

    it('should not render an option to delete a project if user is not admin', () => {
      createTestEnvironment({
        'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
      })
      render(
        <TestAppContainer>
          <GeneralSettingsView />
        </TestAppContainer>,
      )

      expect(screen.queryByRole('heading', {name: 'Delete project'})).not.toBeInTheDocument()
    })

    describe('Deleting a project', () => {
      const title = 'My Title'
      const redirectUrl = '/some-redirect-url'

      const assignFn = jest.fn()

      beforeEach(() => {
        assignFn.mockReset()
      })

      function renderMemexForDelete() {
        // Mock location.assign to verify redirect
        Object.defineProperty(window, 'location', {
          configurable: true,
          writable: true,
          value: {...window.location, assign: assignFn},
        })

        const memex = memexFactory.build({title})
        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
          'memex-data': memex,
          'memex-items-data': [
            draftIssueFactory.build(),
            draftIssueFactory.build(),
            issueFactory.build(),
            redactedItemFactory.build(),
          ],
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )
      }

      it('should should allow deleting a project', async () => {
        renderMemexForDelete()

        const mockDeleteProject = stubResolvedApiResponse(apiDeleteMemex, {redirectUrl})

        await userEvent.click(screen.getByRole('button', {name: 'Delete this project'}))
        await userEvent.type(screen.getByTestId('confirm-delete-input'), title)

        await userEvent.click(screen.getByRole('button', {name: SettingsResources.deleteProjectConfirmation}))

        // Todo: update with redirect behavior
        await waitFor(() => expect(mockDeleteProject).toHaveBeenCalledTimes(1))
        await waitFor(() => expect(assignFn).toHaveBeenCalledWith(redirectUrl))
      })

      it('display a toast if the request to delete a project fails', async () => {
        renderMemexForDelete()

        const error = 'Uh oh!'
        const mockDeleteProject = stubRejectedApiResponse(apiDeleteMemex, new ApiError(error))

        await userEvent.click(screen.getByRole('button', {name: 'Delete this project'}))
        await userEvent.type(screen.getByTestId('confirm-delete-input'), title)

        await userEvent.click(screen.getByRole('button', {name: SettingsResources.deleteProjectConfirmation}))
        await waitFor(() => expect(mockDeleteProject).toHaveBeenCalledTimes(1))

        expect(await screen.findByTestId('toast')).toHaveTextContent(error)
        expect(assignFn).not.toHaveBeenCalled()
      })

      it('passes draftIssueCount through to the dialog', async () => {
        renderMemexForDelete()
        await userEvent.click(screen.getByRole('button', {name: 'Delete this project'}))

        expect(screen.getByText('2 draft issues')).toBeInTheDocument()
      })
    })

    describe('Projects Without Limits Beta Optout', () => {
      const renderMemexForOptout = () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_table_without_limits: true,
          mwl_beta_optout: true,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })

        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )
      }

      const submitOptoutRequest = async () => {
        await userEvent.click(screen.getByRole('button', {name: 'Opt out'}))
        const dialog = await screen.findByRole('alertdialog')
        const optoutButton = await within(dialog).findByRole('button', {name: /Opt out/i})
        await userEvent.click(optoutButton)
      }

      it('clicking opt out button prompts for confirmation', async () => {
        renderMemexForOptout()

        await userEvent.click(screen.getByRole('button', {name: 'Opt out'}))
        expect(await screen.findByRole('alertdialog')).toBeInTheDocument()
      })

      it('clicking opt out confirmation button makes request to server', async () => {
        renderMemexForOptout()

        const postBetaOptoutApiStub = stubResolvedApiResponse(apiMemexWithoutLimitsBetaOptout, {success: true})
        await submitOptoutRequest()
        expect(postBetaOptoutApiStub).toHaveBeenCalledTimes(1)
      })

      it('clicking opt out confirmation cancel button does not make request to server', async () => {
        renderMemexForOptout()

        const postBetaOptoutApiStub = stubResolvedApiResponse(apiMemexWithoutLimitsBetaOptout, {success: true})
        await userEvent.click(screen.getByRole('button', {name: 'Opt out'}))
        const dialog = await screen.findByRole('alertdialog')
        const optoutButton = await within(dialog).findByRole('button', {name: /Cancel/i})
        await userEvent.click(optoutButton)
        expect(postBetaOptoutApiStub).not.toHaveBeenCalledTimes(1)
      })

      it('disables the button and displays a toast when the request succeeds', async () => {
        renderMemexForOptout()
        const postBetaOptoutApiStub = stubResolvedApiResponse(apiMemexWithoutLimitsBetaOptout, {success: true})

        await submitOptoutRequest()
        await waitFor(() => expect(postBetaOptoutApiStub).toHaveBeenCalledTimes(1))

        expect(screen.getByTestId('beta-optout-button')).toBeDisabled()
        expect(await screen.findByTestId('toast')).toHaveTextContent(Resources.betaOptoutSuccessMessage)
      })

      it('displays a toast when the request fails', async () => {
        renderMemexForOptout()
        const postBetaOptoutApiStub = stubRejectedApiResponse(apiMemexWithoutLimitsBetaOptout, new ApiError(''))

        await submitOptoutRequest()
        await waitFor(() => expect(postBetaOptoutApiStub).toHaveBeenCalledTimes(1))

        expect(await screen.findByTestId('toast')).toHaveTextContent(Resources.betaOptoutFailureMessage)
      })

      it('should render an option to opt out of the beta if user is admin and both memex_table_without_limits and mwl_beta_optout flags are enabled,', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_table_without_limits: true,
          mwl_beta_optout: true,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.getByRole('heading', {name: 'Increased project items beta'})).toBeInTheDocument()
      })

      it('should not render an option to opt out of the beta if user is not admin', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_table_without_limits: true,
          mwl_beta_optout: true,
        })

        createTestEnvironment()

        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.queryByRole('heading', {name: 'Increased project items beta'})).not.toBeInTheDocument()
      })

      it('should not render an option to opt out of the beta if the mwl_beta_optout flag is disabled', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_table_without_limits: true,
          mwl_beta_optout: false,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })

        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.queryByRole('heading', {name: 'Increased project items beta'})).not.toBeInTheDocument()
      })

      it('should not render an option to opt out of the beta if the memex_table_without_limits flag is disabled', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_table_without_limits: false,
          mwl_beta_optout: true,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })

        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.queryByRole('heading', {name: 'Increased project items beta'})).not.toBeInTheDocument()
      })
    })

    describe('Resyncing ES Index', () => {
      it('should render an option to resync a project ES index if user is admin and memex_paginated_archive FF is enabled', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_paginated_archive: true,
          memex_resync_index: true,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.getByRole('heading', {name: 'Resync search index for this project'})).toBeInTheDocument()
      })

      it('should render an option to resync a project ES index if user is admin and memex_table_without_limits FF is enabled', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_table_without_limits: true,
          memex_resync_index: true,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.getByRole('heading', {name: 'Resync search index for this project'})).toBeInTheDocument()
      })

      it('should not render consistency data if "memex-consistency-metrics-data" JSON island is not present', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_table_without_limits: true,
          memex_resync_index: true,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
          'memex-data': memexFactory.build(),
          'memex-consistency-metrics-data': undefined,
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.queryByTestId('resync-project-es-index-consistency-value')).not.toBeInTheDocument()
      })

      it.each([
        {consistency: undefined, textValue: 'unknown', color: 'fg.muted'},
        {consistency: 86, textValue: '86%', color: 'danger.fg'},
        {consistency: 99, textValue: '99%', color: 'success.fg'},
      ])(
        'should render consistency data equals to $textValue in the resync ES index option if user is admin and memex_table_without_limits FF is enabled',
        ({consistency, textValue, color}) => {
          asMockHook(useEnabledFeatures).mockReturnValue({
            memex_table_without_limits: true,
            memex_resync_index: true,
          })

          createTestEnvironment({
            'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
            'memex-data': memexFactory.build(),
            'memex-consistency-metrics-data': {consistency, inconsistencyThreshold: 0.95},
          })
          render(
            <TestAppContainer>
              <GeneralSettingsView />
            </TestAppContainer>,
          )

          expect(screen.getByRole('heading', {name: 'Resync search index for this project'})).toBeInTheDocument()

          const textElm = screen.getByTestId('resync-project-es-index-consistency-value')
          expect(textElm).toHaveTextContent(textValue)
          expect(textElm).toHaveStyle(`color: ${color}`)
        },
      )

      it('should not render an option to resync a project ES index if user is not admin and FF is enabled', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_paginated_archive: true,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Write}),
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.queryByRole('heading', {name: 'Resync search index for this project'})).not.toBeInTheDocument()
      })

      it('should not render an option to resync a project ES index if user is admin and FF is disabled', () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_paginated_archive: false,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.queryByRole('heading', {name: 'Resync search index for this project'})).not.toBeInTheDocument()
      })

      it('clicking Resync ES Index button makes request to server', async () => {
        asMockHook(useEnabledFeatures).mockReturnValue({
          memex_paginated_archive: true,
          memex_resync_index: true,
        })

        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })

        const resyncApiStub = stubResolvedApiResponse(apiResyncElasticsearchIndex, {job: {url: 'url'}})

        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        await userEvent.click(screen.getByRole('button', {name: 'Resync search index'}))

        expect(resyncApiStub).toHaveBeenCalledTimes(1)
      })
    })

    describe('Templates', () => {
      const templateOwner = {
        id: 1,
        login: 'github',
        name: 'GitHub',
        avatarUrl: 'https://foo.bar/avatar.png',
        type: 'organization',
      } satisfies Owner

      describe('Created with template memex', () => {
        it('should not show created with template memex if no created-with-memex exists', () => {
          createTestEnvironment({'memex-owner': templateOwner})
          render(
            <TestAppContainer>
              <GeneralSettingsView />
            </TestAppContainer>,
          )

          expect(screen.queryByTestId('created-with-template-link')).not.toBeInTheDocument()
        })

        it('should show created with template memex if created-with-memex exists', async () => {
          createTestEnvironment({
            'created-with-template-memex': {
              url: '/projects/1',
              titleHtml: 'My template',
              id: 1,
            },
            'memex-owner': templateOwner,
          })

          render(
            <TestAppContainer>
              <GeneralSettingsView />
            </TestAppContainer>,
          )

          expect(screen.getByTestId('created-with-template-link')).toBeInTheDocument()

          const linkToTemplate = screen.getByRole('link', {name: 'My template'})
          expect(linkToTemplate).toHaveAttribute('href', '/projects/1')

          await userEvent.click(linkToTemplate)
          const expectedStatsPayload = {
            templateMemexId: 1,
          }

          expect(mockPostStats).toHaveBeenCalledWith({
            name: CreatedWithTemplateClick,
            ui: ProjectDescriptionSettingsPageUI,
            context: JSON.stringify(expectedStatsPayload),
          })
        })
      })

      it('should allow admin user to make a template for an organization-owned project', () => {
        const memex = memexFactory.build()
        memex.closedAt = null

        createTestEnvironment({
          'memex-data': memex,
          'memex-viewer-privileges': overrideDefaultPrivileges({
            role: Role.Admin,
            canChangeProjectVisibility: true,
          }),
          'memex-owner': {
            id: 1,
            login: 'github',
            name: 'GitHub',
            avatarUrl: 'https://foo.bar/avatar.png',
            type: 'organization',
          },
        })

        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.getByText('Make template')).toBeInTheDocument()
        // get the ToggleSwitch component
        expect(screen.getByLabelText('Make template')).toBeEnabled()
      })

      it('should disable the "make a template" toggle for a closed project', () => {
        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({
            role: Role.Admin,
            canChangeProjectVisibility: true,
          }),
          'memex-owner': {
            id: 1,
            login: 'github',
            name: 'GitHub',
            avatarUrl: 'https://foo.bar/avatar.png',
            type: 'organization',
          },
        })

        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.getByText('Make template')).toBeInTheDocument()
        // get the ToggleSwitch component
        expect(screen.getByLabelText('Make template')).not.toBeEnabled()
      })

      it('should not allow user to make a template for a user-owned project', () => {
        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({role: Role.Admin}),
        })

        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )
        expect(screen.queryByRole('heading', {name: 'Make template'})).not.toBeInTheDocument()
        // look for the the ToggleSwitch component
        expect(screen.queryByLabelText('Make template')).not.toBeInTheDocument()
      })

      it('should show option to copy as template for an organization-owned project', () => {
        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({
            role: Role.Write,
            canChangeProjectVisibility: true,
            canCopyAsTemplate: true,
          }),
          'memex-owner': {
            id: 1,
            login: 'github',
            name: 'GitHub',
            avatarUrl: 'https://foo.bar/avatar.png',
            type: 'organization',
          },
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.getByTestId('copy-as-template-button')).toBeEnabled()
      })

      it('should not show option to copy as template for an user-owned project', () => {
        createTestEnvironment({
          'memex-viewer-privileges': overrideDefaultPrivileges({
            role: Role.Write,
            canChangeProjectVisibility: true,
            canCopyAsTemplate: true,
          }),
        })
        render(
          <TestAppContainer>
            <GeneralSettingsView />
          </TestAppContainer>,
        )

        expect(screen.queryByRole('button', {name: 'Copy as template'})).not.toBeInTheDocument()
      })
    })
  })
})
