import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {Overview} from '../routes/Overview'
import {getOverviewRoutePayload, getCreateBranchButtonOptions, getRepository} from '../test-utils/mock-data'
import {wrapActiveClassNameException} from '../test-utils/wrap-active-class-name-exception'
import {CreateBranchButtonOptionProvider} from '../contexts/CreateBranchButtonOptionContext'
import {CurrentRepositoryProvider} from '@github-ui/current-repository'

test('renders page', () => {
  const repo = getRepository()
  const routePayload = getOverviewRoutePayload()
  wrapActiveClassNameException(() => {
    render(
      <CurrentRepositoryProvider repository={repo}>
        <CreateBranchButtonOptionProvider options={getCreateBranchButtonOptions({repository: repo})}>
          <Overview />
        </CreateBranchButtonOptionProvider>
      </CurrentRepositoryProvider>,
      {
        routePayload,
      },
    )

    expect(screen.getByRole('heading', {level: 1})).toHaveTextContent('Branches')
    expect(screen.getByRole('tab', {selected: true})).toHaveTextContent('Overview')
  })
})

describe('branch banner', () => {
  test('does not render branch banner on a security advisory', () => {
    const repo = getRepository()
    const routePayload = getOverviewRoutePayload()
    routePayload.protectThisBranchBanner.isSecurityAdvisory = true
    wrapActiveClassNameException(() => {
      render(
        <CurrentRepositoryProvider repository={repo}>
          <CreateBranchButtonOptionProvider options={getCreateBranchButtonOptions({repository: repo})}>
            <Overview />
          </CreateBranchButtonOptionProvider>
        </CurrentRepositoryProvider>,
        {
          routePayload,
        },
      )

      expect(screen.queryByTestId('protect-this-branch-banner')).not.toBeInTheDocument()
    })
  })

  test('renders branch banner on a non-Security Advisory repo', () => {
    const repo = getRepository()
    const routePayload = getOverviewRoutePayload()
    routePayload.protectThisBranchBanner.isSecurityAdvisory = false // redundant, but for clarity
    wrapActiveClassNameException(() => {
      render(
        <CurrentRepositoryProvider repository={repo}>
          <CreateBranchButtonOptionProvider options={getCreateBranchButtonOptions({repository: repo})}>
            <Overview />
          </CreateBranchButtonOptionProvider>
        </CurrentRepositoryProvider>,
        {
          routePayload,
        },
      )

      expect(screen.getByTestId('protect-this-branch-banner')).toBeInTheDocument()
    })
  })
})
