import {screen} from '@testing-library/react'
import {announce} from '@github-ui/aria-live'
import {render, type User} from '@github-ui/react-core/test-utils'
import {getListRoutePayload, getCreateBranchButtonOptions, getRepository} from '../test-utils/mock-data'
import {wrapActiveClassNameException} from '../test-utils/wrap-active-class-name-exception'
import {CreateBranchButtonOptionProvider} from '../contexts/CreateBranchButtonOptionContext'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {Yours, Active, All, Stale} from '../routes/List'
import {BRANCH_PAGES} from '../constants'

test.each(BRANCH_PAGES.filter(page => page.type !== 'overview').map(page => [page.type, page]))(
  'renders %s page',
  (type, page) => {
    const repo = getRepository()
    const routePayload = getListRoutePayload()

    let Component: React.FC

    switch (type) {
      case 'yours':
        Component = Yours
        break
      case 'active':
        Component = Active
        break
      case 'stale':
        Component = Stale
        break
      case 'all':
        Component = All
        break
      default:
        throw new Error(`Unexpected type: ${type}`)
    }

    wrapActiveClassNameException(() => {
      render(
        <CurrentRepositoryProvider repository={repo}>
          <CreateBranchButtonOptionProvider options={getCreateBranchButtonOptions({repository: repo})}>
            <Component />
          </CreateBranchButtonOptionProvider>
        </CurrentRepositoryProvider>,
        {
          routePayload,
        },
      )

      expect(screen.getByRole('heading')).toHaveTextContent('Branches')
      expect(screen.getByRole('tab', {selected: true})).toHaveTextContent(page.title)
    })
  },
)

test('announces search results to screen readers', async () => {
  const region = document.createElement('div')
  region.id = 'js-global-screen-reader-notice'
  region.classList.add('sr-only')
  region.setAttribute('aria-live', 'polite')

  const repo = getRepository()
  const routePayload = getListRoutePayload()
  const Component: React.FC = All

  let user: User
  await wrapActiveClassNameException(() => {
    const view = render(
      <CurrentRepositoryProvider repository={repo}>
        <CreateBranchButtonOptionProvider options={getCreateBranchButtonOptions({repository: repo})}>
          <Component />
        </CreateBranchButtonOptionProvider>
      </CurrentRepositoryProvider>,
      {
        routePayload,
      },
    )
    user = view.user
  })
  document.body.appendChild(region)

  const searchInput = screen.getByRole('textbox', {name: 'Search'})
  await user!.type(searchInput, 'h')
  expect(searchInput).toHaveValue('h')
  announce('No results found')
  expect(screen.getByText('No results found')).toBeInTheDocument()
})
