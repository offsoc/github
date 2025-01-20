import {fireEvent, render, screen} from '@testing-library/react'
import {getInitialIndexedRepos} from '../test-utils/mock-data'
import {RemoveIndexedReposDialog} from '../components/RemoveIndexedReposDialog'

const onClose = jest.fn()
const onSubmit = jest.fn()

const defaultProps = {
  onClose,
  onSubmit,
  repos: getInitialIndexedRepos().map(repo => repo.name),
  processing: false,
}

describe('RemoveIndexedReposDialog', () => {
  test('Lists the selected repos', async () => {
    render(<RemoveIndexedReposDialog {...defaultProps} />)

    expect(screen.getByText('repo1')).toBeInTheDocument()
    expect(screen.getByText('repo2')).toBeInTheDocument()
  })

  test('Calls submit', async () => {
    render(<RemoveIndexedReposDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Remove indexes'))
    expect(onSubmit).toHaveBeenCalled()
  })

  test('Calls cancel', async () => {
    render(<RemoveIndexedReposDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })
})
