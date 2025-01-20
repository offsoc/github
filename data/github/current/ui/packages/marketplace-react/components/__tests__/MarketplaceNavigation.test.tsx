import {screen, fireEvent} from '@testing-library/react'
import MarketplaceNavigation from '../MarketplaceNavigation'
import {mockCategory} from '../../test-utils/mock-data'
import {renderWithFilterContext} from '../../test-utils/Render'
import {useLocation} from 'react-router-dom'

jest.mock('@github-ui/use-navigate')
jest.mock('@github-ui/react-core/use-feature-flag')
jest.mock('react-router-dom', () => ({...jest.requireActual('react-router-dom'), useLocation: jest.fn()}))
const mockedUseLocation = jest.mocked(useLocation)

beforeEach(() => {
  const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
  useSearchParams.mockImplementation(() => [new URLSearchParams(), jest.fn()])
  mockedUseLocation.mockReturnValue({state: '', key: 'k1', pathname: '/marketplace', search: '', hash: ''})
})

const renderComponent = () => {
  renderWithFilterContext(
    <MarketplaceNavigation
      categories={{
        apps: [mockCategory({name: 'App category', slug: 'app-category'})],
        actions: [mockCategory({name: 'Action category', slug: 'action-category'})],
      }}
    />,
  )
}

describe('MarketplaceNavigation', () => {
  test('renders navigation with categories', () => {
    renderComponent()

    expect(screen.getByRole('link', {name: 'Featured'})).toHaveAttribute('href', '/marketplace')
    expect(screen.getByRole('link', {name: 'Copilot'})).toHaveAttribute(
      'href',
      '/marketplace?type=apps&copilot_app=true',
    )
    expect(screen.getByRole('button', {name: 'Apps'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Actions'})).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Create a new extension'})).toHaveAttribute('href', '/marketplace/new')
  })

  test('can interact with app categories', () => {
    renderComponent()

    const appsNavButton = screen.getByRole('button', {name: 'Apps'})
    expect(appsNavButton).toBeInTheDocument()

    expect(screen.queryByRole('link', {name: 'All apps'})).not.toBeInTheDocument()
    expect(screen.queryByRole('link', {name: 'App category'})).not.toBeInTheDocument()

    fireEvent.click(appsNavButton)
    expect(screen.getByRole('link', {name: 'All apps'})).toHaveAttribute('href', '/marketplace?type=apps')
    expect(screen.getByRole('link', {name: 'App category'})).toHaveAttribute(
      'href',
      '/marketplace?type=apps&category=app-category',
    )
  })

  test('can interact with action categories', () => {
    renderComponent()

    const actionsNavButton = screen.getByRole('button', {name: 'Actions'})
    expect(actionsNavButton).toBeInTheDocument()

    expect(screen.queryByRole('link', {name: 'All actions'})).not.toBeInTheDocument()
    expect(screen.queryByRole('link', {name: 'Action category'})).not.toBeInTheDocument()

    fireEvent.click(actionsNavButton)
    expect(screen.getByRole('link', {name: 'All actions'})).toHaveAttribute('href', '/marketplace?type=actions')
    expect(screen.getByRole('link', {name: 'Action category'})).toHaveAttribute(
      'href',
      '/marketplace?type=actions&category=action-category',
    )
  })

  test('Selects "Featured" if params are empty', () => {
    const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
    const params = new URLSearchParams()
    useSearchParams.mockImplementation(() => [params, jest.fn()])
    renderComponent()

    expect(screen.getByRole('link', {name: 'Featured'})).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Copilot'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'App category', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'All apps', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Action category', hidden: true})).not.toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', {name: 'All actions', hidden: true})).not.toHaveAttribute('aria-current', 'page')
  })

  test('Selects "Copilot" if type is apps and copilott_app is true in the params', () => {
    const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
    const params = new URLSearchParams()
    params.set('type', 'apps')
    params.set('copilot_app', 'true')
    useSearchParams.mockImplementation(() => [params, jest.fn()])
    renderComponent()

    expect(screen.getByRole('link', {name: 'Featured'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Copilot'})).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'App category', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'All apps', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Action category', hidden: true})).not.toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', {name: 'All actions', hidden: true})).not.toHaveAttribute('aria-current', 'page')
  })

  test('Selects "All apps" if type is apps no category in the params', () => {
    const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
    const params = new URLSearchParams()
    params.set('type', 'apps')
    useSearchParams.mockImplementation(() => [params, jest.fn()])
    renderComponent()

    expect(screen.getByRole('link', {name: 'Featured'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Copilot'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'App category', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'All apps', hidden: true})).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Action category', hidden: true})).not.toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', {name: 'All actions', hidden: true})).not.toHaveAttribute('aria-current', 'page')
  })

  test('Selects "App category" if type is apps the category slug in the params', () => {
    const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
    const params = new URLSearchParams()
    params.set('type', 'apps')
    params.set('category', 'app-category')
    useSearchParams.mockImplementation(() => [params, jest.fn()])
    renderComponent()

    expect(screen.getByRole('link', {name: 'Featured'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Copilot'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'App category', hidden: true})).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'All apps', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Action category', hidden: true})).not.toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', {name: 'All actions', hidden: true})).not.toHaveAttribute('aria-current', 'page')
  })

  test('Selects "All actions" if type is actions no category in the params', () => {
    const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
    const params = new URLSearchParams()
    params.set('type', 'actions')
    useSearchParams.mockImplementation(() => [params, jest.fn()])
    renderComponent()

    expect(screen.getByRole('link', {name: 'Featured'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Copilot'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'App category', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'All apps', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Action category', hidden: true})).not.toHaveAttribute(
      'aria-current',
      'page',
    )
    expect(screen.getByRole('link', {name: 'All actions', hidden: true})).toHaveAttribute('aria-current', 'page')
  })

  test('Selects "Action category" if type is actions the category slug in the params', () => {
    const {useSearchParams} = jest.requireMock('@github-ui/use-navigate')
    const params = new URLSearchParams()
    params.set('type', 'actions')
    params.set('category', 'action-category')
    useSearchParams.mockImplementation(() => [params, jest.fn()])
    renderComponent()

    expect(screen.getByRole('link', {name: 'Featured'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Copilot'})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'App category', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'All apps', hidden: true})).not.toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'Action category', hidden: true})).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', {name: 'All actions', hidden: true})).not.toHaveAttribute('aria-current', 'page')
  })

  describe('Model category', () => {
    test('renders the Models category', () => {
      renderComponent()

      expect(screen.getByRole('link', {name: 'Models'})).toBeInTheDocument()
    })

    test('marks Models as selected if location starts with /marketplace/models', () => {
      const {useFeatureFlag} = jest.requireMock('@github-ui/react-core/use-feature-flag')
      useFeatureFlag.mockImplementation(() => true)
      mockedUseLocation.mockReturnValue({state: '', key: 'k1', pathname: '/marketplace/models', search: '', hash: ''})
      renderComponent()

      expect(screen.getByRole('link', {name: 'Models'})).toHaveAttribute('aria-current', 'page')
    })
  })
})
