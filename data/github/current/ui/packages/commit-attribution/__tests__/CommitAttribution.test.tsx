import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {CommitAttribution} from '../CommitAttribution'
import {createRepository} from '@github-ui/current-repository/test-helpers'
import {ghost, hubot, monalisa, webflow} from '../test-utils/mock-data'

const repo = createRepository()

describe('Commit Attribution', () => {
  test('single author renders an AuthorAvatar', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={webflow}
        committerAttribution={false}
        includeVerbs={true}
      />,
    )

    expect(screen.getByTestId('author-avatar')).toBeInTheDocument()
    expect(screen.queryByTestId('author-link')).not.toBeInTheDocument()
    expect(screen.queryByTestId('commit-avatar-stack')).not.toBeInTheDocument()
    expect(screen.queryByTestId('authors-dialog-anchor')).not.toBeInTheDocument()
  })

  test('author and committer renders an AvatarStack and two AuthorLinks with correct copy', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={hubot}
        committerAttribution={true}
        includeVerbs={true}
      />,
    )

    expect(screen.queryByTestId('author-avatar')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('author-link')).toHaveLength(2)
    expect(screen.getAllByTestId('commit-stack-avatar')).toHaveLength(2)
    expect(screen.queryByTestId('authors-dialog-anchor')).not.toBeInTheDocument()

    expect(screen.getByText('authored', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('committed')).toBeInTheDocument()
  })

  test('two authors renders an AvatarStack and two AuthorLinks with correct copy', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa, hubot]}
        committer={webflow}
        committerAttribution={false}
        includeVerbs={true}
      />,
    )

    expect(screen.queryByTestId('author-avatar')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('author-link')).toHaveLength(2)
    expect(screen.getAllByTestId('commit-stack-avatar')).toHaveLength(2)
    expect(screen.queryByTestId('authors-dialog-anchor')).not.toBeInTheDocument()

    expect(screen.queryByText('authored', {exact: false})).not.toBeInTheDocument()
    expect(screen.getByText('committed')).toBeInTheDocument()

    expect(screen.getByText('monalisa')).toBeInTheDocument()
    expect(screen.getByText('hubot')).toBeInTheDocument()
    expect(screen.queryByText('webflow')).not.toBeInTheDocument()
  })

  test('more than two authors renders AvatarStack and AuthorsDialog', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa, hubot, ghost]}
        committer={webflow}
        committerAttribution={false}
        includeVerbs={true}
      />,
    )

    expect(screen.queryByTestId('author-avatar')).not.toBeInTheDocument()
    expect(screen.queryByTestId('author-link')).not.toBeInTheDocument()
    expect(screen.getAllByTestId('commit-stack-avatar')).toHaveLength(3)
    expect(screen.getByTestId('authors-dialog-anchor')).toBeInTheDocument()

    expect(screen.getByText('3 people')).toBeInTheDocument()
    expect(screen.queryByText('monalisa')).not.toBeInTheDocument()
    expect(screen.queryByText('hubot')).not.toBeInTheDocument()
    expect(screen.queryByText('ghost')).not.toBeInTheDocument()
    expect(screen.queryByText('webflow')).not.toBeInTheDocument()
  })
})

describe('Commit Attribution - Verbs', () => {
  test('can render with verbs', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={hubot}
        committerAttribution={true}
        includeVerbs={true}
      />,
    )

    expect(screen.getByText('monalisa')).toBeInTheDocument()
    expect(screen.getByText('authored', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('hubot')).toBeInTheDocument()
    expect(screen.getByText('committed')).toBeInTheDocument()
  })

  test('can render without verbs', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={hubot}
        committerAttribution={true}
        includeVerbs={false}
      />,
    )

    expect(screen.getByText('monalisa')).toBeInTheDocument()
    expect(screen.getByText('and')).toBeInTheDocument()
    expect(screen.getByText('hubot')).toBeInTheDocument()

    expect(screen.queryByText('authored', {exact: false})).not.toBeInTheDocument()
    expect(screen.queryByText('committed')).not.toBeInTheDocument()
  })
})

describe('Commit Attribution - Author Settings', () => {
  test('renders with default values when no author settings are passed', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={hubot}
        committerAttribution={false}
        includeVerbs={false}
      />,
    )

    const authorLink = screen.getByText('monalisa')
    expect(getComputedStyle(authorLink).fontWeight).toBe('600')
    expect(authorLink).toHaveStyle('color: var(--fgColor-default,var(--color-fg-default,#1F2328))') // fg.default

    const authorAvatar = screen.getByTestId('github-avatar')
    expect(authorAvatar).toHaveAttribute('width', '20')
    expect(authorAvatar).toHaveAttribute('height', '20')

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  test('can render author link with a custom font weight', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={hubot}
        committerAttribution={true}
        includeVerbs={false}
        authorSettings={{
          fontWeight: 'normal',
        }}
      />,
    )

    const authorLink = screen.getByText('monalisa')
    expect(getComputedStyle(authorLink).fontWeight).toBe('400')
  })

  test('can render author link with a custom font color', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={hubot}
        committerAttribution={true}
        includeVerbs={false}
        authorSettings={{
          fontColor: 'fg.muted',
        }}
      />,
    )

    const authorLink = screen.getByText('monalisa')
    expect(authorLink).toHaveStyle('color: var(--fgColor-muted,var(--color-fg-muted,#656d76))')
  })

  test('can render author avatar with custom avatar size', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={hubot}
        committerAttribution={false}
        includeVerbs={false}
        authorSettings={{
          avatarSize: 16,
        }}
      />,
    )

    const authorAvatar = screen.getByTestId('github-avatar')
    expect(authorAvatar).toHaveAttribute('width', '16')
    expect(authorAvatar).toHaveAttribute('height', '16')
  })

  test('can render author link with a tooltip', () => {
    render(
      <CommitAttribution
        repo={repo}
        authors={[monalisa]}
        committer={hubot}
        committerAttribution={false}
        includeVerbs={false}
        authorSettings={{
          includeTooltip: true,
        }}
      />,
    )

    const authorLink = screen.getByText('monalisa')

    expect(authorLink).toHaveAccessibleDescription('commits by monalisa')
  })
})
