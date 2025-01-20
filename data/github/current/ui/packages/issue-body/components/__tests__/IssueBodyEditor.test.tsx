import type {SubjectType} from '@github-ui/comment-box/subject'
import {VALIDATORS} from '@github-ui/entity-validators'
import {render} from '@github-ui/react-core/test-utils'
import {act, screen, waitFor, within} from '@testing-library/react'
import type React from 'react'

import {TEST_IDS} from '../../constants/test-ids'
import {IssueBodyEditor} from '../IssueBodyEditor'

const data = {
  body: 'test_body',
  bodyHTML: '<p>test_body_html</p>',
}

jest.mock('react-relay', () => ({
  ...jest.requireActual('react-relay'),
  useFragment: jest.fn(() => data),
}))

const baseInput = {
  subjectId: 'test_subject_id',
  subject: {
    type: 'issue' as SubjectType,
    repository: {databaseId: 456, nwo: 'github/github', slashCommandsEnabled: true},
  },
  title: 'test_title',
  body: data.body,
  dataTestId: 'body',

  onChange: () => {},

  onCancel: () => {},

  onCommit: () => {},
  isDirty: false,
}
const renderBody = (children: React.ReactNode) => render(<>{children}</>)

test('valid input', async () => {
  renderBody(<IssueBodyEditor {...baseInput} />)

  const saveButton = await waitFor(() =>
    within(screen.getByTestId(TEST_IDS.commentBox('body')))
      .getByText('Save')
      // eslint-disable-next-line testing-library/no-node-access
      .closest('button'),
  )
  expect(saveButton).toBeEnabled()
})

test('long body', async () => {
  const longBody = 'a'.repeat(VALIDATORS.maxBodyLength + 1)
  renderBody(<IssueBodyEditor {...baseInput} body={longBody} />)

  const saveButton = await waitFor(() =>
    within(screen.getByTestId(TEST_IDS.commentBox('body')))
      .getByText('Save')
      // eslint-disable-next-line testing-library/no-node-access
      .closest('button'),
  )

  expect(saveButton).toBeEnabled()
  act(() => {
    saveButton?.click()
  })

  const error = await screen.findByText(VALIDATORS.issueBodyExceedsMaxLength)
  expect(error).toBeInTheDocument()
})

test('no changes', async () => {
  renderBody(<IssueBodyEditor {...baseInput} />)

  const saveButton = await waitFor(() =>
    within(screen.getByTestId(TEST_IDS.commentBox('body')))
      .getByText('Save')
      // eslint-disable-next-line testing-library/no-node-access
      .closest('button'),
  )

  expect(saveButton).toBeEnabled()
})
