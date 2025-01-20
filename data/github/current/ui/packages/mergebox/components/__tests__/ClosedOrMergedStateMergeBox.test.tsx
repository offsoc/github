import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {ClosedOrMergedStateMergeBox} from '../ClosedOrMergedStateMergeBox'

afterEach(() => {
  jest.clearAllMocks()
})

const defaultProps: {
  state: 'CLOSED' | 'OPEN' | 'MERGED'
  headRefName: string
  headRepository: {
    owner: {
      login: string
    }
    name: string
  }
  viewerCanDeleteHeadRef: boolean
  viewerCanRestoreHeadRef: boolean
} = {
  state: 'CLOSED',
  headRefName: 'branch-name',
  headRepository: {
    owner: {
      login: 'monalisa',
    },
    name: 'smile',
  },
  viewerCanDeleteHeadRef: true,
  viewerCanRestoreHeadRef: true,
}

const defaultCallbacks = {
  onDeleteHeadRef: jest.fn(),
  onRestoreHeadRef: jest.fn(),
}

const TestComponent = (props: Partial<typeof defaultProps & typeof defaultCallbacks>) => {
  const combinedProps = {
    ...defaultProps,
    ...defaultCallbacks,
    ...props,
  }
  return <ClosedOrMergedStateMergeBox {...combinedProps} />
}

describe('open', () => {
  test('does not render anything when state is open', async () => {
    render(<TestComponent state="OPEN" />)

    expect(screen.queryByText('Closed with unmerged commits')).toBeNull()
    expect(screen.queryByText('Pull request successfully merged and closed')).toBeNull()
  })
})

describe('closed', () => {
  test('renders nothing when the viewer cannot take an action', async () => {
    render(<TestComponent state="CLOSED" viewerCanDeleteHeadRef={false} viewerCanRestoreHeadRef={false} />)

    expect(screen.queryByText('Closed with unmerged commits')).toBeNull()
  })

  test('renders the status and a button when the viewer can restore the head ref', async () => {
    render(<TestComponent state="CLOSED" viewerCanDeleteHeadRef={false} viewerCanRestoreHeadRef={true} />)

    expect(screen.getByText('Closed with unmerged commits')).toBeInTheDocument()
    expect(screen.getByText('Restore branch')).toBeInTheDocument()
    expect(screen.getByText('This pull request is closed and the', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('branch has been deleted.', {exact: false})).toBeInTheDocument()
  })

  test('renders the closed state when the viewer can delete and restore the head ref', async () => {
    render(
      <TestComponent
        state="CLOSED"
        viewerCanDeleteHeadRef={true}
        viewerCanRestoreHeadRef={true}
        headRefName="update-packages-and-readme-ref"
      />,
    )

    expect(screen.getByText('Closed with unmerged commits')).toBeInTheDocument()
    expect(screen.getByText('This pull request is closed, but the', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('branch has unmerged commits.', {exact: false})).toBeInTheDocument()

    const branchElement = screen.getByRole('link', {name: /update-packages-and-readme-ref/})

    expect(branchElement).toHaveAttribute('href', '/monalisa/smile/tree/update-packages-and-readme-ref')
    expect(screen.getByRole('button', {name: 'Delete branch'})).toBeInTheDocument()
  })

  test('renders the closed state when the viewer can only delete the head ref', async () => {
    render(<TestComponent headRefName="update-packages-and-readme-ref" />)

    expect(screen.getByText('Closed with unmerged commits')).toBeInTheDocument()
    expect(screen.getByText('This pull request is closed, but the', {exact: false})).toBeInTheDocument()
    expect(screen.getByText('branch has unmerged commits.', {exact: false})).toBeInTheDocument()

    const branchElement = screen.getByRole('link', {name: /update-packages-and-readme-ref/})

    expect(branchElement).toHaveAttribute('href', '/monalisa/smile/tree/update-packages-and-readme-ref')
    expect(screen.getByRole('button', {name: 'Delete branch'})).toBeInTheDocument()
  })
})

describe('closed state, deleting branch', () => {
  test('disables the delete button until OnCompleted has been called', async () => {
    let onCompletedCallback: () => void
    const spy = jest.fn(function ({onCompleted}) {
      onCompletedCallback = onCompleted
    })

    render(<TestComponent onDeleteHeadRef={spy} />)

    const deleteButton = screen.getByRole('button', {name: 'Delete branch'})

    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).not.toBeDisabled()

    act(() => {
      deleteButton.click()
    })

    expect(spy).toHaveBeenCalled()
    expect(deleteButton).toBeDisabled()

    act(() => {
      onCompletedCallback()
    })

    expect(deleteButton).not.toBeDisabled()
  })

  test('renders the error state to try again when an error has occured', async () => {
    let onErrorCallback: () => void
    const spy = jest.fn(function ({onError}) {
      onErrorCallback = onError
    })

    render(<TestComponent onDeleteHeadRef={spy} />)

    const deleteButton = screen.getByRole('button', {name: 'Delete branch'})

    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).not.toBeDisabled()

    act(() => {
      deleteButton.click()
    })

    expect(spy).toHaveBeenCalled()
    expect(deleteButton).toBeDisabled()

    act(() => {
      onErrorCallback()
    })

    expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Delete branch'})).not.toBeInTheDocument()
  })
})

describe('merged', () => {
  test('renders the merged state when the viewer can delete the head ref', async () => {
    render(<TestComponent state="MERGED" headRefName="update-packages-and-readme-ref" />)

    expect(screen.getByText('Pull request successfully merged and closed')).toBeInTheDocument()
    expect(screen.getByText("You're all set — the", {exact: false})).toBeInTheDocument()
    expect(screen.getByText('branch can be safely deleted', {exact: false})).toBeInTheDocument()

    const branchElement = screen.getByRole('link', {name: /update-packages-and-readme-ref/})
    expect(branchElement).toHaveAttribute('href', '/monalisa/smile/tree/update-packages-and-readme-ref')

    expect(screen.getByRole('button', {name: 'Delete branch'})).toBeInTheDocument()
  })

  test('renders the merged state when the viewer can restore the head ref', async () => {
    render(<TestComponent state="MERGED" headRefName="update-packages-and-readme-ref" viewerCanDeleteHeadRef={false} />)

    expect(screen.getByText('Pull request successfully merged and closed')).toBeInTheDocument()
    expect(screen.getByText("You're all set — the", {exact: false})).toBeInTheDocument()
    expect(screen.getByText('branch has been merged and deleted', {exact: false})).toBeInTheDocument()

    const branchElement = screen.queryByRole('link', {name: /update-packages-and-readme-ref/})
    expect(branchElement).toBeNull()

    expect(screen.getByRole('button', {name: 'Restore branch'})).toBeInTheDocument()
  })

  test('renders only the delete branch button if the viewer can both delete and restore the head ref', async () => {
    render(<TestComponent state="MERGED" headRefName="update-packages-and-readme-ref" />)

    expect(screen.getByText('Pull request successfully merged and closed')).toBeInTheDocument()
    expect(screen.getByText("You're all set — the", {exact: false})).toBeInTheDocument()
    expect(screen.getByText('branch can be safely deleted', {exact: false})).toBeInTheDocument()

    const branchElement = screen.getByRole('link', {name: /update-packages-and-readme-ref/})
    expect(branchElement).toBeInTheDocument()

    expect(screen.getByRole('button', {name: 'Delete branch'})).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Restore branch'})).toBeNull()
  })
})

describe('merged state, after restoring branch', () => {
  test('disabled the Restore branch button until onCompleted has been called', async () => {
    let onCompletedCallback: () => void
    const spy = jest.fn(function ({onCompleted}) {
      onCompletedCallback = onCompleted
    })

    render(
      <TestComponent
        state="MERGED"
        viewerCanDeleteHeadRef={false}
        viewerCanRestoreHeadRef={true}
        onRestoreHeadRef={spy}
      />,
    )

    const restoreButton = screen.getByRole('button', {name: 'Restore branch'})

    expect(restoreButton).toBeInTheDocument()
    expect(restoreButton).not.toBeDisabled()

    act(() => {
      restoreButton.click()
    })

    expect(spy).toHaveBeenCalled()
    expect(restoreButton).toBeDisabled()

    act(() => {
      onCompletedCallback()
    })

    expect(restoreButton).not.toBeDisabled()
    expect(restoreButton).toBeInTheDocument()
  })

  test('renders the error state to try again when an error has occured', async () => {
    let onErrorCallback: () => void
    const spy = jest.fn(function ({onError}) {
      onErrorCallback = onError
    })
    render(
      <TestComponent
        state="MERGED"
        viewerCanDeleteHeadRef={false}
        viewerCanRestoreHeadRef={true}
        onRestoreHeadRef={spy}
      />,
    )

    const restoreButton = screen.getByRole('button', {name: 'Restore branch'})

    expect(restoreButton).toBeInTheDocument()
    expect(restoreButton).not.toBeDisabled()

    act(() => {
      restoreButton.click()
    })

    expect(spy).toHaveBeenCalled()
    expect(restoreButton).toBeDisabled()

    act(() => {
      onErrorCallback()
    })

    expect(screen.getByRole('button', {name: 'Try again'})).toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Restore branch'})).not.toBeInTheDocument()
  })
})
