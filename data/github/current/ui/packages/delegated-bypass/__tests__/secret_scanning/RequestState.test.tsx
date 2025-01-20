import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RequestState} from '../../components/RequestState'
import {RequestTypeProvider} from '../../contexts/RequestTypeContext'
import {
  approvedSecretScanningRequest,
  completedSecretScanningRequest,
  rejectedSecretScanningRequest,
  pendingSecretScanningRequest,
} from './secret_scanning_helpers'

describe('RequestState: approved requests', () => {
  it('renders for the reviewer', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={approvedSecretScanningRequest}
          responses={approvedSecretScanningRequest.exemptionResponses}
          isRequester={false}
          reviewerLogin="collaborator"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.getByText('Bypass request approved')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'View collaborator profile'})).toHaveAttribute('href', '/collaborator')
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Dismiss approval'})).toBeInTheDocument()
  })

  it('renders for the requester', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={approvedSecretScanningRequest}
          responses={approvedSecretScanningRequest.exemptionResponses}
          isRequester={true}
          reviewerLogin="monalisa"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.getByText('Bypass request approved')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'View collaborator profile'})).toHaveAttribute('href', '/collaborator')
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Dismiss approval'})).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', {name: 'Cancel request'})).toHaveLength(1)
  })

  it('renders for other users', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={approvedSecretScanningRequest}
          responses={approvedSecretScanningRequest.exemptionResponses}
          isRequester={false}
          reviewerLogin="web-flow"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.getByText('Bypass request approved')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'View collaborator profile'})).toHaveAttribute('href', '/collaborator')
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Dismiss approval'})).not.toBeInTheDocument()
  })
})

describe('RequestState: rejected requests', () => {
  it('renders for the reviewer', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={rejectedSecretScanningRequest}
          responses={rejectedSecretScanningRequest.exemptionResponses}
          isRequester={false}
          reviewerLogin="collaborator"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.getByText('Bypass request denied')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'View collaborator profile'})).toHaveAttribute('href', '/collaborator')
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Dismiss denial'})).toBeInTheDocument()
  })

  it('renders for the requester', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={rejectedSecretScanningRequest}
          responses={rejectedSecretScanningRequest.exemptionResponses}
          isRequester={true}
          reviewerLogin="monalisa"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.getByText('Bypass request denied')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'View collaborator profile'})).toHaveAttribute('href', '/collaborator')
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Dismiss denial'})).not.toBeInTheDocument()
    expect(screen.getByRole('button', {name: 'Cancel request'})).toBeInTheDocument()
  })

  it('renders for other users', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={rejectedSecretScanningRequest}
          responses={rejectedSecretScanningRequest.exemptionResponses}
          isRequester={false}
          reviewerLogin="web-flow"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.getByText('Bypass request denied')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'View collaborator profile'})).toHaveAttribute('href', '/collaborator')
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Dismiss denial'})).not.toBeInTheDocument()
  })
})

describe('RequestState: pending requests', () => {
  it('renders for the reviewer', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={pendingSecretScanningRequest}
          responses={[]}
          isRequester={false}
          reviewerLogin="collaborator"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Dismiss approval'})).not.toBeInTheDocument()
  })

  it('renders for the requester', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={pendingSecretScanningRequest}
          responses={[]}
          isRequester={true}
          reviewerLogin="monalisa"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByText('Dismiss approval')).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', {name: 'Cancel request'})).toHaveLength(1)
  })

  it('renders for other users', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={pendingSecretScanningRequest}
          responses={[]}
          isRequester={false}
          reviewerLogin="web-flow"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
    expect(screen.queryByText('Dismiss approval')).not.toBeInTheDocument()
  })
})

describe('RequestState: completed requests', () => {
  it('renders for the reviewer', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={completedSecretScanningRequest}
          responses={[]}
          isRequester={false}
          reviewerLogin="collaborator"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Dismiss approval'})).not.toBeInTheDocument()
  })

  it('renders for the requester', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={completedSecretScanningRequest}
          responses={[]}
          isRequester={true}
          reviewerLogin="monalisa"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByText('Dismiss approval')).not.toBeInTheDocument()
    // You cannot cancel a completed (terminal) request
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
  })

  it('renders for other users', () => {
    render(
      <RequestTypeProvider requestType="secret_scanning">
        <RequestState
          request={pendingSecretScanningRequest}
          responses={[]}
          isRequester={false}
          reviewerLogin="web-flow"
        />
      </RequestTypeProvider>,
    )

    expect(screen.getByText('Bypass request submitted')).toBeInTheDocument()
    expect(screen.queryByText('for')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', {name: 'Cancel request'})).not.toBeInTheDocument()
    expect(screen.queryByText('Dismiss approval')).not.toBeInTheDocument()
  })
})
