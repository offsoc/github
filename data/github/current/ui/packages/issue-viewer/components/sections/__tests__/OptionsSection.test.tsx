import {screen} from '@testing-library/react'
import {renderRelay} from '@github-ui/relay-test-utils'
import {graphql} from 'relay-runtime'
import type {OptionsSectionTestQuery} from './__generated__/OptionsSectionTestQuery.graphql'
import {ISSUE_VIEWER_DEFAULT_CONFIG} from '../../OptionConfig'
import {OptionsSection} from '../OptionsSection'
import {BUTTON_LABELS} from '../../../constants/buttons'
import {LABELS} from '../../../constants/labels'

const query = graphql`
  query OptionsSectionTestQuery @relay_test_operation {
    node(id: "issue1") {
      ...OptionsSectionFragment
    }
  }
`

const mockUseFeatureFlags = jest.fn().mockReturnValue({})
jest.mock('@github-ui/react-core/use-feature-flag', () => ({
  useFeatureFlags: () => mockUseFeatureFlags({}),
}))

beforeEach(() => {
  mockUseFeatureFlags.mockClear()
})

it('Does not render options or issue types when viewer cannot update the issue', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: false,
              viewerCanDelete: false,
              viewerCanTransfer: false,
              viewerCanType: false,
              issueType: null,
            }
          },
        },
      },
    },
  )

  // Entire component is expected not to render if user has no permissions
  expect(screen.queryByRole('list')).not.toBeInTheDocument()
})

test('Does not render h2 heading if no options are available', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: false,
              viewerCanDelete: false,
              viewerCanTransfer: false,
              viewerCanConvertToDiscussion: false,
              viewerCanType: false,
            }
          },
        },
      },
    },
  )

  expect(screen.queryByRole('heading', {level: 2, name: LABELS.optionsTitle})).not.toBeInTheDocument()
})

test('Renders h2 heading when at least one option is available', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: true,
              viewerCanDelete: false,
              viewerCanTransfer: false,
              viewerCanPinIssues: false,
              viewerCanConvertToDiscussion: false,
              viewerCanType: false,
            }
          },
        },
      },
    },
  )

  expect(screen.getByRole('heading', {level: 2, name: LABELS.optionsTitle})).toBeInTheDocument()
})

test('Does render pin option when viewer can pin issues to the repository', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              repository: {
                viewerCanPinIssues: true,
              },
            }
          },
        },
      },
    },
  )

  expect(screen.getByText(BUTTON_LABELS.pinIssue)).toBeInTheDocument()
})

test('Does not render pin option when viewer cannot pin issues to the repository', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              repository: {
                viewerCanPinIssues: false,
              },
            }
          },
        },
      },
    },
  )

  expect(screen.queryByText(BUTTON_LABELS.pinIssue)).not.toBeInTheDocument()
})

it('Does render issue types when viewer can type the issue', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: false,
              viewerCanDelete: false,
              viewerCanTransfer: false,
              viewerCanType: true,
            }
          },
        },
      },
    },
  )

  expect(screen.getByText(BUTTON_LABELS.changeIssueType)).toBeInTheDocument()
})

it('Does render "Add issue types" button when no issue type is present', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: false,
              viewerCanDelete: false,
              viewerCanTransfer: false,
              viewerCanType: true,
              issueType: null,
            }
          },
        },
      },
    },
  )

  expect(screen.getByText(BUTTON_LABELS.addIssueType)).toBeInTheDocument()
})

it('Does render transfer issue', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: true,
              viewerCanDelete: false,
              viewerCanTransfer: true,
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('Transfer issue')).toBeInTheDocument()
})

it('Does not render issue transfer button if the user cannot update but can delete current repo', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: true,
              viewerCanDelete: true,
              viewerCanTransfer: false,
            }
          },
        },
      },
    },
  )

  expect(screen.queryByText('Transfer issue')).not.toBeInTheDocument()
})

test('Does not render delete button if the user cannot delete but can update current repo', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: true,
              viewerCanDelete: false,
              viewerCanTransfer: true,
            }
          },
        },
      },
    },
  )

  expect(screen.getByText('Transfer issue')).toBeInTheDocument()
  expect(screen.queryByText('Delete permanently')).not.toBeInTheDocument()
})

test('Renders h2 heading for screen reader navigation', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanUpdateNext: true,
              viewerCanDelete: false,
              viewerCanTransfer: true,
            }
          },
        },
      },
    },
  )

  expect(screen.getByRole('heading', {level: 2, name: LABELS.optionsTitle})).toBeInTheDocument()
})

test('Does not render the `Convert to discussion` button when the viewer is not authorized to convert', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanConvertToDiscussion: false,
            }
          },
        },
      },
    },
  )

  expect(screen.queryByText(BUTTON_LABELS.convertToDiscussion)).not.toBeInTheDocument()
})

test('Renders the `Convert to discussion` button when the viewer is authorized to convert', () => {
  renderRelay<{
    issue: OptionsSectionTestQuery
  }>(
    ({queryData: {issue}}) => (
      <OptionsSection optionConfig={ISSUE_VIEWER_DEFAULT_CONFIG} optionsSection={issue.node!} />
    ),
    {
      relay: {
        queries: {
          issue: {
            type: 'fragment',
            query,
            variables: {},
          },
        },
        mockResolvers: {
          Issue() {
            return {
              id: 'issue1',
              viewerCanConvertToDiscussion: true,
            }
          },
        },
      },
    },
  )

  expect(screen.getByText(BUTTON_LABELS.convertToDiscussion)).toBeInTheDocument()
})
