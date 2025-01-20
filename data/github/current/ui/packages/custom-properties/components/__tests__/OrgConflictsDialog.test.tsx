import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {OrgConflictsDialog} from '../OrgConflictsDialog'

describe('OrgConflictsDialog', () => {
  it('renders too many orgs message if total usages is more than displayed list', async () => {
    render(
      <OrgConflictsDialog
        onClose={() => null}
        orgConflicts={{
          totalUsageCount: 3,
          usages: [
            {name: 'acme', avatarUrl: 'avatar.com', propertyType: 'single_select'},
            {name: 'foocorp', avatarUrl: 'avatar2.com', propertyType: 'string'},
          ],
        }}
      />,
    )

    expect(
      screen.getByText(
        "This property cannot be created because there are conflicting properties in this enterprise's organizations (showing 2 out of a total 3 conflicts).",
        {exact: false},
      ),
    ).toBeInTheDocument()
  })
})
