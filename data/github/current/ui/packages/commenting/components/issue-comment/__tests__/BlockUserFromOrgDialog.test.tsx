import {noop} from '@github-ui/noop'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {RelayEnvironmentProvider} from 'react-relay'
import {createMockEnvironment} from 'relay-test-utils'

import {blockUserFromOrganization} from '../../../mutations/block-user-from-organization-mutation'
import {BLOCKING_DURATION_TO_READABLE_MAP, BlockUserFromOrgDialog} from '../BlockUserFromOrgDialog'

jest.mock('../../../mutations/block-user-from-organization-mutation')
const mockedSubmitMutation = jest.mocked(blockUserFromOrganization)

afterEach(() => {
  jest.clearAllMocks()
})

const DEFAULT_ORG = {
  login: 'test-org',
  id: 'test-org-id',
}

const DEFAULT_ID = 'test-id'

const DEFAULT_AUTHOR = {
  login: 'test-author',
  id: 'test-author-id',
}

const DEFAULT_URL = 'test-url'

type RenderBlockUserFromOrgDialogProps = {
  organization?: {login: string; id: string}
  commentId?: string
  commentAuthor?: {login: string; id: string}
  commentUrl?: string
}

const RenderBlockUserFromOrgDialog = ({
  organization = DEFAULT_ORG,
  commentId = DEFAULT_ID,
  commentAuthor = DEFAULT_AUTHOR,
  commentUrl = DEFAULT_URL,
}: RenderBlockUserFromOrgDialogProps) => {
  const environment = createMockEnvironment()

  render(
    <RelayEnvironmentProvider environment={environment}>
      <BlockUserFromOrgDialog
        organization={organization}
        contentId={commentId}
        contentAuthor={commentAuthor}
        contentUrl={commentUrl}
        onClose={noop}
      />
    </RelayEnvironmentProvider>,
  )
}

test('renders the dialog header and footer', () => {
  RenderBlockUserFromOrgDialog({})
  expect(screen.getByText(`Block ${DEFAULT_AUTHOR.login} from ${DEFAULT_ORG.login}`)).toBeInTheDocument()
  expect(screen.getByRole('button', {name: 'Block user from organization'})).toBeInTheDocument()
})

test('default options are checked correctly', () => {
  RenderBlockUserFromOrgDialog({})
  expect(
    screen.getByRole('button', {
      name: `Block a user: ${BLOCKING_DURATION_TO_READABLE_MAP['INDEFINITE']}`,
    }),
  ).toBeInTheDocument()
  expect(screen.getByLabelText('Send user a notification and show activity in timeline')).toBeChecked()
  expect(screen.getByLabelText(`Hide this user's comments`)).not.toBeChecked()
})

test('submits mutation call correctly', () => {
  RenderBlockUserFromOrgDialog({})
  const submitButton = screen.getByRole('button', {name: 'Block user from organization'})
  act(() => submitButton.click())
  expect(mockedSubmitMutation).toHaveBeenCalledTimes(1)

  // Correctly check the mutation parameters passed in
  const mutationCall = mockedSubmitMutation.mock.calls.at(0)![0]
  expect(mutationCall.input.organizationId).toBe(DEFAULT_ORG.id)
  expect(mutationCall.input.blockedUserId).toBe(DEFAULT_AUTHOR.id)
  expect(mutationCall.input.contentId).toBe(DEFAULT_ID)
  expect(mutationCall.input.duration).toBe('INDEFINITE')
  expect(mutationCall.input.hiddenReason).toBe(undefined)
})
