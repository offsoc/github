import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {OrgSelector} from '../OrgSelector'

test('Renders the OrgSelector', () => {
  const message = 'Select organizations'
  render(
    <OrgSelector
      baseAvatarUrl=""
      selectedOrgs={[]}
      selectOrg={() => {}}
      removeOrg={() => {}}
      orgLoader={async () => {
        return await []
      }}
    />,
  )
  expect(screen.getByRole('button')).toHaveTextContent(message)
})
