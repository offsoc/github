import {render, screen} from '@testing-library/react'
import {OrganizationIcon} from '@primer/octicons-react'
import {HierarchicalOrgCard} from '../HierarchicalOrgCard'

describe('HierarchicalOrgCard', () => {
  test('renders title and description correctly', () => {
    const title = 'Test Title'
    const description = 'Test Description'
    const icon = OrganizationIcon
    render(<HierarchicalOrgCard title={title} description={description} icon={icon} />)

    expect(screen.getByTestId('org-card-title')).toHaveTextContent(title)
    expect(screen.getByTestId('org-card-description')).toHaveTextContent(description)
    expect(screen.getByTestId('org-card-icon')).toBeInTheDocument()
  })

  test('renders title only when description is not provided', () => {
    const title = 'Test Title'
    const icon = OrganizationIcon
    render(<HierarchicalOrgCard title={title} icon={icon} />)

    expect(screen.getByTestId('org-card-title')).toHaveTextContent(title)
    expect(screen.queryByTestId('org-card-description')).toBeEmptyDOMElement()
    expect(screen.getByTestId('org-card-icon')).toBeInTheDocument()
  })

  test('renders default icon when icon is not provided', () => {
    const title = 'Test Title'
    const description = 'Test Description'
    render(<HierarchicalOrgCard title={title} description={description} />)

    expect(screen.getByTestId('org-card-icon')).toBeInTheDocument()
  })
})
