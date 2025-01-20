import {render} from '@github-ui/react-core/test-utils'
import {EditPathsDialog} from '../EditPathsDialog'
import {screen} from '@testing-library/react'
import {getRepoDataPayload} from '../../../test-utils/mock-data'

describe('EditPathsDialog', () => {
  const repo = {...getRepoDataPayload(), paths: []}

  test('Renders the EditPathsDialog route component', async () => {
    render(<EditPathsDialog onClose={jest.fn()} repo={repo} />)

    expect(screen.getByRole('heading', {name: 'Edit paths', level: 1})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Apply'})).toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument()
    expect(screen.getByLabelText('Paths')).toBeInTheDocument()
  })

  test('sets repo paths when paths are provided', async () => {
    const onClose = jest.fn()
    const {user} = render(<EditPathsDialog onClose={onClose} repo={repo} />)

    const pathsInput = screen.getByLabelText('Paths')
    const applyButton = screen.getByRole('button', {name: 'Apply'})
    await user.type(pathsInput, 'path1\npath2\npath3')
    await user.click(applyButton)

    expect(onClose).toHaveBeenCalled()
  })

  test('Is pre-filled with repo paths if repo paths exists', async () => {
    const repoWithPaths = {
      ...repo,
      paths: ['path1', 'path2', 'path3'],
    }
    render(<EditPathsDialog onClose={jest.fn()} repo={repoWithPaths} />)

    const pathsInput = screen.getByLabelText('Paths')
    expect(pathsInput).toHaveValue('path1\npath2\npath3')
  })
})
