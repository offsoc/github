import {screen, render} from '@testing-library/react'
import {OrganizationNameMessage} from '../OrganizationNameMessage'

const defaultStatus = {
  exists: false,
  is_name_modified: false,
  name: 'test-org-name',
  not_alphanumeric: false,
  over_max_length: false,
  unavailable: false,
}

describe('OrganizationNameMessage', () => {
  it('renders the default message', () => {
    const props = {
      ...defaultStatus,
    }
    render(<OrganizationNameMessage {...props} />)
    expect(screen.getByTestId('org-name-message')).toHaveTextContent(
      'This will be the name of your organization on GitHub.',
    )
    expect(screen.getByTestId('org-name-message')).toHaveTextContent('Your URL will be:')
    expect(screen.getByTestId('org-name-message')).toHaveTextContent('test-org-name')
    expect(screen.getByTestId('org-name-message')).not.toHaveTextContent(
      'which has been adjusted to comply with our naming rules',
    )
  })

  it('renders the modified name message', () => {
    const props = {
      ...defaultStatus,
      is_name_modified: true,
    }
    render(<OrganizationNameMessage {...props} />)
    expect(screen.getByTestId('org-name-message')).toHaveTextContent(
      'which has been adjusted to comply with our naming rules',
    )
  })

  it('renders the exists name message', () => {
    const props = {
      ...defaultStatus,
      exists: true,
    }
    render(<OrganizationNameMessage {...props} />)
    expect(screen.getByTestId('org-name-message-exists')).toBeInTheDocument()
  })

  it('renders the not alphanumeric name message', () => {
    const props = {
      ...defaultStatus,
      not_alphanumeric: true,
    }
    render(<OrganizationNameMessage {...props} />)
    expect(screen.getByTestId('org-name-message-non-alphanumeric')).toBeInTheDocument()
  })

  it('renders the over max length name message', () => {
    const props = {
      ...defaultStatus,
      over_max_length: true,
    }
    render(<OrganizationNameMessage {...props} />)
    expect(screen.getByTestId('org-name-message-over-max')).toBeInTheDocument()
  })

  it('renders the unavailable name message', () => {
    const props = {
      ...defaultStatus,
      unavailable: true,
    }
    render(<OrganizationNameMessage {...props} />)
    expect(screen.getByTestId('org-name-message-unavailable')).toBeInTheDocument()
  })
})
