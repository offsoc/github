import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {List} from '../routes/List'
import {getAppPayload, getListRoutePayload} from '../test-utils/mock-data'
import {GroupTreeProvider} from '../contexts/GroupTreeContext'
import {OrganizationProvider} from '../contexts/OrganizationContext'

test('Renders the List', () => {
  const routePayload = getListRoutePayload()
  const appPayload = getAppPayload()
  render(
    <OrganizationProvider organization={appPayload.organization}>
      <GroupTreeProvider groups={routePayload.groups}>
        <List />
      </GroupTreeProvider>
    </OrganizationProvider>,
    {
      routePayload,
      appPayload,
    },
  )
  expect(screen.getByRole('heading', {name: 'Groups'})).toBeInTheDocument()
})
