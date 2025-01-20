import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {DelegatedBypassRow} from '../components/DelegatedBypassRow'
import {
  exampleRequest,
  baseExemptionUrl,
  approvedRequest,
  deniedRequest,
  completedRequest,
  expiredRequest,
  cancelledRequest,
  requestWithDismissedResponse,
} from './helpers'

describe('DelegatedBypassRow', () => {
  it('renders a bypass exemption request', () => {
    render(<DelegatedBypassRow exemptionRequest={exampleRequest} baseExemptionUrl={baseExemptionUrl} />)

    expect(screen.getByText('Bypass ruleset1 and 1 more ruleset')).toBeInTheDocument()
    expect(screen.getByRole('link', {name: 'Bypass ruleset1 and 1 more ruleset'})).toHaveAttribute(
      'href',
      `${baseExemptionUrl}${exampleRequest.number}`,
    )
    expect(screen.getByText(`submitted on ${exampleRequest.createdAt}`)).toBeInTheDocument()
  })

  it('renders an approved exemption request', () => {
    render(<DelegatedBypassRow exemptionRequest={approvedRequest} baseExemptionUrl={baseExemptionUrl} />)

    expect(screen.getByRole('link', {name: 'Bypass ruleset1 and 1 more ruleset'})).toHaveAttribute(
      'href',
      `${baseExemptionUrl}${approvedRequest.number}`,
    )
    expect(screen.getByText('• Request approved by')).toBeInTheDocument()
  })

  it('renders a denied bypass exemption request', () => {
    render(<DelegatedBypassRow exemptionRequest={deniedRequest} baseExemptionUrl={baseExemptionUrl} />)

    expect(screen.getByRole('link', {name: 'Bypass ruleset1 and 1 more ruleset'})).toHaveAttribute(
      'href',
      `${baseExemptionUrl}${deniedRequest.number}`,
    )
    expect(screen.getByText('• Request denied by')).toBeInTheDocument()
    expect(screen.getByText('Denied')).toBeInTheDocument()
  })

  it('renders a completed bypass exemption request', () => {
    render(<DelegatedBypassRow exemptionRequest={completedRequest} baseExemptionUrl={baseExemptionUrl} />)

    expect(screen.getByRole('link', {name: 'Bypass ruleset1 and 1 more ruleset'})).toHaveAttribute(
      'href',
      `${baseExemptionUrl}${completedRequest.number}`,
    )
    expect(screen.getByText('• Request approved by')).toBeInTheDocument()
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('renders an expired bypass exemption request', () => {
    render(<DelegatedBypassRow exemptionRequest={expiredRequest} baseExemptionUrl={baseExemptionUrl} />)

    expect(screen.getByRole('link', {name: 'Bypass ruleset1 and 1 more ruleset'})).toHaveAttribute(
      'href',
      `${baseExemptionUrl}${expiredRequest.number}`,
    )
    expect(screen.getByText('Expired')).toBeInTheDocument()
  })

  it('renders a cancelled bypass exemption request', () => {
    render(<DelegatedBypassRow exemptionRequest={cancelledRequest} baseExemptionUrl={baseExemptionUrl} />)

    expect(screen.getByRole('link', {name: 'Bypass ruleset1 and 1 more ruleset'})).toHaveAttribute(
      'href',
      `${baseExemptionUrl}${cancelledRequest.number}`,
    )
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
  })

  it('renders a bypass exemption request with a dismissed response', () => {
    render(<DelegatedBypassRow exemptionRequest={requestWithDismissedResponse} baseExemptionUrl={baseExemptionUrl} />)

    expect(screen.getByRole('link', {name: 'Bypass ruleset1 and 1 more ruleset'})).toHaveAttribute(
      'href',
      `${baseExemptionUrl}${requestWithDismissedResponse.number}`,
    )
    expect(screen.getByText(`submitted on ${exampleRequest.createdAt}`)).toBeInTheDocument()
  })
})
