import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {GitHubAvatar} from '../GitHubAvatar'

it('happy path', () => {
  render(<GitHubAvatar src="https://avatars.githubusercontent.com/mona" />)
  expect(screen.getByTestId('github-avatar')).toHaveProperty(
    'src',
    'https://avatars.githubusercontent.com/mona?size=40',
  )
})

it('size is set as ?size URL query parameter', () => {
  render(<GitHubAvatar src="https://avatars.githubusercontent.com/mona?size=100" />)
  expect(screen.getByTestId('github-avatar')).toHaveProperty(
    'src',
    'https://avatars.githubusercontent.com/mona?size=100',
  )
})

it('size is set both as prop and as ?size URL query parameter', () => {
  render(<GitHubAvatar src="https://avatars.githubusercontent.com/mona?size=100" size={20} />)
  expect(screen.getByTestId('github-avatar')).toHaveProperty(
    'src',
    'https://avatars.githubusercontent.com/mona?size=100',
  )
})

it('size is set as ?s URL query parameter', () => {
  render(<GitHubAvatar src="https://avatars.githubusercontent.com/mona?s=100" />)
  expect(screen.getByTestId('github-avatar')).toHaveProperty('src', 'https://avatars.githubusercontent.com/mona?s=100')
})

it('use current origin if path is relative', () => {
  render(<GitHubAvatar src="/mona.png" />)
  expect(screen.getByTestId('github-avatar')).toHaveProperty('src', 'http://localhost/mona.png?size=40')
})

it('allows to use custom testid', () => {
  render(<GitHubAvatar src="https://avatars.githubusercontent.com/mona" data-testid="my-test-id" />)
  expect(screen.getByTestId('my-test-id')).toHaveProperty('src', 'https://avatars.githubusercontent.com/mona?size=40')
})
