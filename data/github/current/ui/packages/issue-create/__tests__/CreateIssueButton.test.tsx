import {noop} from '@github-ui/noop'
import {CreateIssueButton} from '../CreateIssueButton'
import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'

const mockUseFeatureFlags = jest.fn()
jest.mock('@github-ui/react-core/use-feature-flag', () => ({
  useFeatureFlags: () => mockUseFeatureFlags({}),
}))

jest.mock('../dialog/CreateIssueDialogEntry', () => {
  const CreateIssueDialogEntryMock = () => <p>dialog is open</p>
  return {CreateIssueDialogEntryInternal: CreateIssueDialogEntryMock}
})

describe('when migration FF disabled', () => {
  beforeEach(() => {
    mockUseFeatureFlags.mockReturnValue({issues_react_ui_commands_migration: false})
  })

  test('it opens dialog on click', async () => {
    const {user} = render(<CreateIssueButton label="New issue" navigate={noop} />)

    await user.click(screen.getByRole('link', {name: 'New issue'}))

    expect(screen.getByText('dialog is open')).toBeVisible()
  })

  test('it renders the button without hotkey hint', () => {
    render(<CreateIssueButton label="New issue" navigate={noop} />)

    expect(screen.queryByRole('link', {name: 'New issue'})).toBeVisible()
  })
})

describe('when migration FF enabled', () => {
  beforeEach(() => {
    mockUseFeatureFlags.mockReturnValue({issues_react_ui_commands_migration: true})
  })

  test('it renders the button with hotkey hint', () => {
    render(<CreateIssueButton label="New issue" navigate={noop} />)

    expect(screen.queryByRole('link', {name: 'New issue'})).toBeVisible()
  })

  test('it opens dialog on click', async () => {
    const {user} = render(<CreateIssueButton label="New issue" navigate={noop} />)

    await user.click(screen.getByRole('link', {name: 'New issue'}))

    expect(screen.getByText('dialog is open')).toBeVisible()
  })

  test('it opens dialog on hotkey', async () => {
    const {user} = render(<CreateIssueButton label="New issue" navigate={noop} />)

    await user.keyboard('c')

    expect(screen.getByText('dialog is open')).toBeVisible()
  })
})
