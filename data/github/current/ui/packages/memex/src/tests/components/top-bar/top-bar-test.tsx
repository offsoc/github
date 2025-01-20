import {render, screen} from '@testing-library/react'

import type {Owner} from '../../../client/api/common-contracts'
import {TopBar} from '../../../client/components/top-bar'
import {MemexTitle} from '../../../client/components/top-bar/memex-title'
import {useEnabledFeatures} from '../../../client/hooks/use-enabled-features'
import {memexFactory} from '../../factories/memexes/memex-factory'
import {mockUseHasColumnData} from '../../mocks/hooks/use-has-column-data'
import {asMockHook} from '../../mocks/stub-utilities'
import {createTestEnvironment, TestAppContainer} from '../../test-app-wrapper'

jest.mock('../../../client/hooks/use-enabled-features')

const templateOwner = {
  id: 1,
  login: 'github',
  name: 'GitHub',
  avatarUrl: 'https://foo.bar/avatar.png',
  type: 'organization',
} satisfies Owner

describe('TopBar', () => {
  beforeEach(() => {
    mockUseHasColumnData()
    asMockHook(useEnabledFeatures).mockReturnValue({})
  })

  describe('Memex Title', () => {
    it('should render the project title', () => {
      const memex = memexFactory.build({titleHtml: 'My Memex'})
      createTestEnvironment({
        'memex-data': memex,
      })

      render(
        <TestAppContainer>
          <TopBar isProjectPath>
            <MemexTitle />
          </TopBar>
        </TestAppContainer>,
      )

      expect(screen.getByRole('heading', {name: 'My Memex'})).toBeInTheDocument()
    })
  })

  describe('Beta pill', () => {
    it('should render the beta pill if memex_table_without_limits is enabled', () => {
      asMockHook(useEnabledFeatures).mockReturnValue({memex_table_without_limits: true})
      const memex = memexFactory.build({titleHtml: 'My Memex'})
      createTestEnvironment({
        'memex-data': memex,
      })

      render(
        <TestAppContainer>
          <TopBar isProjectPath>
            <MemexTitle />
          </TopBar>
        </TestAppContainer>,
      )

      expect(screen.getByTestId('memex_without_limits_beta_label')).toBeInTheDocument()
    })

    it('should not render the beta pill if memex_table_without_limits is disabled', () => {
      const memex = memexFactory.build({titleHtml: 'My Memex'})
      createTestEnvironment({
        'memex-data': memex,
      })

      render(
        <TestAppContainer>
          <TopBar isProjectPath>
            <MemexTitle />
          </TopBar>
        </TestAppContainer>,
      )

      expect(screen.queryByTestId('memex_without_limits_beta_label')).not.toBeInTheDocument()
    })

    it('should render the beta pill if the kill switch is enabled', () => {
      const memex = memexFactory.build({titleHtml: 'My Memex'})
      createTestEnvironment({
        'memex-data': memex,
        'memex-service': {betaSignupBanner: 'hidden', killSwitchEnabled: true},
      })

      render(
        <TestAppContainer>
          <TopBar isProjectPath>
            <MemexTitle />
          </TopBar>
        </TestAppContainer>,
      )

      expect(screen.getByTestId('memex_without_limits_beta_label')).toBeInTheDocument()
    })
  })

  describe('Use this template', () => {
    it('should not show use template button on non-templates', () => {
      const memex = memexFactory.build({titleHtml: 'My Memex', isTemplate: false})
      createTestEnvironment({
        'memex-data': memex,
        'memex-owner': templateOwner,
      })

      render(
        <TestAppContainer>
          <TopBar isProjectPath>
            <MemexTitle />
          </TopBar>
        </TestAppContainer>,
      )

      expect(screen.queryByRole('button', {name: 'Use this template'})).not.toBeInTheDocument()
    })

    it('shows use template button on templates', () => {
      const memex = memexFactory.build({titleHtml: 'My Memex', isTemplate: true, templateId: 1})
      createTestEnvironment({
        'memex-data': memex,
        'memex-owner': templateOwner,
      })

      render(
        <TestAppContainer>
          <TopBar isProjectPath>
            <MemexTitle />
          </TopBar>
        </TestAppContainer>,
      )

      expect(screen.getByRole('button', {name: 'Use this template'})).toBeInTheDocument()
    })
  })
})
