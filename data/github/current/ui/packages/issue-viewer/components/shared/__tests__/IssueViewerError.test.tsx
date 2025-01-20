import {noop} from '@github-ui/noop'
import {fireEvent, render, screen} from '@testing-library/react'
import {renderGenericError, renderIssueViewerErrors} from '../IssueViewerError'

describe('renderGenericError', () => {
  it('renders the generic error component', () => {
    render(renderGenericError(noop))

    expect(screen.getByText("Couldn't load")).toBeInTheDocument()
    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('retry callback called when pressing retry button', () => {
    const retryMock = jest.fn()

    render(renderGenericError(retryMock))

    const retryButton = screen.getByText('Try again')
    fireEvent.click(retryButton)

    expect(retryMock).toHaveBeenCalledTimes(1)
  })
})

describe('renderIssueViewerErrors', () => {
  it('renders an issue not found message on NOT_FOUND error', () => {
    render(renderIssueViewerErrors(noop, {name: 'error', message: 'NOT_FOUND'}))

    expect(screen.queryByText("Couldn't load")).not.toBeInTheDocument()
    expect(screen.getByText('Issue not found')).toBeInTheDocument()
    expect(screen.getByText('This issue does not exist or has been deleted.')).toBeInTheDocument()
  })

  it('calls renderGenericError for other errors', () => {
    render(renderIssueViewerErrors(noop, {name: 'error', message: 'COOL_ERROR'}))

    renderIssueViewerErrors(noop, {name: 'error', message: 'COOL_ERROR'})

    expect(screen.getByText("Couldn't load")).toBeInTheDocument()
    expect(screen.queryByText('Issue not found')).not.toBeInTheDocument()
    expect(screen.queryByText('This issue does not exist or has been deleted.')).not.toBeInTheDocument()
  })
})
