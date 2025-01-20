import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

import {unblockUserFromOrganization} from '../../../mutations/unblock-user-from-organization-mutation'
import {UnblockUserFromOrgDialog} from '../UnblockUserFromOrgDialog'

jest.mock('../../../mutations/unblock-user-from-organization-mutation')
const mockedSubmitMutation = jest.mocked(unblockUserFromOrganization)

afterEach(() => {
  jest.clearAllMocks()
})

const DEFAULT_ORG = {
  login: 'test-org',
  id: 'test-org-id',
}
const DEFAULT_AUTHOR = {
  login: 'test-author',
  id: 'test-author-id',
}

type RenderBlockUserFromOrgDialogProps = {
  organization?: {login: string; id: string}
  commentAuthor?: {login: string; id: string}
}

const RenderUnblockUserFromOrgDialog = ({
  organization = DEFAULT_ORG,
  commentAuthor = DEFAULT_AUTHOR,
}: RenderBlockUserFromOrgDialogProps) => {
  const environment = createMockEnvironment()

  render(
    <RelayEnvironmentProvider environment={environment}>
      <UnblockUserFromOrgDialog
        organization={organization}
        contentAuthor={commentAuthor}
        onClose={noop}
        contentId="test-id"
      />
    </RelayEnvironmentProvider>,
  )
}

test('renders the dialog correctly', () => {
  RenderUnblockUserFromOrgDialog({})
  expect(screen.getByText(`Unblock ${DEFAULT_AUTHOR.login} from ${DEFAULT_ORG.login}`)).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Unblock user'})).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
})

test('submits mutation call correctly', () => {
  RenderUnblockUserFromOrgDialog({})
  const submitButton = screen.getByRole('button', {name: 'Unblock user'})
  act(() => submitButton.click())
  expect(mockedSubmitMutation).toHaveBeenCalledTimes(1)

  // Correctly check the mutation parameters passed in
  const mutationCall = mockedSubmitMutation.mock.calls.at(0)![0]
  expect(mutationCall.input.organizationId).toBe(DEFAULT_ORG.id)
  expect(mutationCall.input.unblockedUserId).toBe(DEFAULT_AUTHOR.id)
})

test('does not submit mutation call when cancel button is clicked', () => {
  RenderUnblockUserFromOrgDialog({})
  const cancelButton = screen.getByRole('button', {name: 'Cancel'})
  act(() => cancelButton.click())
  expect(mockedSubmitMutation).toHaveBeenCalledTimes(0)
})
