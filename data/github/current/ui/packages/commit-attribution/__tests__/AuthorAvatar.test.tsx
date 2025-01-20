import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {AuthorAvatar} from '../components/AuthorAvatar'
import {createRepository} from '@github-ui/current-repository/test-helpers'
import {createAuthor} from './test-helper'

const repo = createRepository()

test('Can render AuthorAvatar', () => {
  render(<AuthorAvatar author={createAuthor()} repo={repo} />)
  expect(screen.getByTestId('author-avatar')).toBeInTheDocument()
})

test("AuthorAvatar doesn't render if no author provided", () => {
  render(<AuthorAvatar author={undefined} repo={repo} />)
  expect(screen.queryByTestId('author-avatar')).not.toBeInTheDocument()
})

test('AuthorAvatar renders a GitHubAvatar', () => {
  const author = createAuthor()
  render(<AuthorAvatar author={author} repo={repo} />)
  expect(screen.getByTestId('github-avatar')).toBeInTheDocument()
  expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining(author.avatarUrl))
  expect(screen.getByRole('img')).toHaveAttribute('aria-label', author.login)
  expect(screen.getByRole('img')).toHaveAttribute('data-testid', 'github-avatar')
})

test('AuthorAvatar renders a user link when provided a path', () => {
  const author = createAuthor({login: undefined})
  render(<AuthorAvatar author={author} repo={repo} />)

  const userLink = screen.getByTestId('avatar-icon-link')

  expect(userLink).toHaveAttribute('href', author.path)
  expect(userLink).not.toHaveAttribute('data-hovercard-url')
})

test('AuthorAvatar renders a user link with a hovercard when provided a path and login', () => {
  const author = createAuthor()
  render(<AuthorAvatar author={author} repo={repo} />)

  const userLink = screen.getByTestId('avatar-icon-link')

  expect(userLink).toHaveAttribute('href', author.path)
  expect(userLink).toHaveAttribute('data-hovercard-url')
})

test('AuthorAvatar renders a commits by author link with a hovercard when provided a login', () => {
  const author = createAuthor()
  render(<AuthorAvatar author={author} repo={repo} />)

  const link = screen.getByRole('link', {name: `commits by ${author.login}`})
  expect(link).toHaveTextContent(author.login!)
  expect(link).toHaveAttribute('data-hovercard-url')
})

test('AuthorAvatar renders a display name when no login is provided', () => {
  const author = createAuthor({login: undefined})
  render(<AuthorAvatar author={author} repo={repo} />)

  expect(screen.getByText(author.displayName)).toBeInTheDocument()
})

test('AuthorAvatar renders with default size, fontweight, and no tooltip behavior', () => {
  const author = createAuthor()
  render(<AuthorAvatar author={author} repo={repo} />)

  const authorLink = screen.getByText('monalisa')
  expect(getComputedStyle(authorLink).fontWeight).toBe('600')

  const authorAvatar = screen.getByTestId('github-avatar')
  expect(authorAvatar).toHaveAttribute('width', '20')
  expect(authorAvatar).toHaveAttribute('height', '20')

  expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
})
