import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {ReviewerAvatar} from '../ReviewerAvatar'

test('Renders the ReviewerAvatar', () => {
  const author = {
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  }
  render(<ReviewerAvatar state={'APPROVED'} author={author} />)
  expect(screen.getByAltText("monalisa's reviewer avatar image")).toBeInTheDocument()
})

test('Renders the ReviewerAvatar with no icon if it is a suggested reviewer', () => {
  const author = {
    login: 'monalisa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
  }
  render(<ReviewerAvatar state={'SUGGESTED'} author={author} />)
  expect(screen.getByAltText("monalisa's suggested reviewer avatar image")).toBeInTheDocument()
})
