import {render} from '@github-ui/react-core/test-utils'
import {fireEvent, screen} from '@testing-library/react'
import type {PropertyDescriptor} from '../../../types/rules-types'
import {AddPropertyDialog, type AddPropertyDialogProps} from '../conditions/AddPropertyDialog'

const customProperties: PropertyDescriptor[] = [
  {
    name: 'ci_enabled',
    description: '',
    valueType: 'true_false',
    allowedValues: undefined,
    source: 'custom',
    icon: 'note',
    displayName: 'Property: ci_enabled',
  },
  {
    name: 'database',
    description:
      'Tenetur aperiam commodi. Aliquam vitae aut. Eius saepe veniam. Quo itaque voluptas. Voluptatem et voluptate. Aut ex eum. Molestiae voluptas tempora. Aut asperiores nobis. Qui quo dolor. Placeat eum eveniet. Reiciendis ad temporibus. Culpa et quas. A.',
    valueType: 'single_select',
    allowedValues: ['postgresql', 'mysql', 'mongo'],
    source: 'custom',
    icon: 'note',
    displayName: 'Property: database',
  },
  {
    name: 'deployment',
    description: 'Enim commodi eum. Rerum et qui. Aut et labore.',
    valueType: 'string',
    allowedValues: undefined,
    source: 'custom',
    icon: 'note',
    displayName: 'Property: deployment',
  },
  {
    name: 'fork',
    description: '',
    valueType: 'true_false',
    allowedValues: ['true', 'false'],
    source: 'system',
    icon: 'repo-forked',
    displayName: 'Fork',
  },
]

const defaultProps: AddPropertyDialogProps = {
  properties: customProperties,
  onAdd: jest.fn(),
  onClose: jest.fn(),
  includeOrExclude: 'include',
}

describe('AddPropertyDialog', () => {
  test('should render', () => {
    render(<AddPropertyDialog {...defaultProps} />)

    expect(screen.getByText('Include repositories by property')).toBeInTheDocument()
  })

  test('should display the properties', () => {
    render(<AddPropertyDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Select property'))

    expect(screen.getByText('Property: ci_enabled')).toBeInTheDocument()
    expect(screen.getByText('Property: database')).toBeInTheDocument()
    expect(screen.getByText('Property: deployment')).toBeInTheDocument()
    expect(screen.getByText('Fork')).toBeInTheDocument()
  })

  test('should display the allowed values for a property', () => {
    render(<AddPropertyDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Select property'))
    fireEvent.click(screen.getByText('Property: database'))

    fireEvent.click(screen.getByText('Select a value'))

    expect(screen.getByText('postgresql')).toBeInTheDocument()
    expect(screen.getByText('mysql')).toBeInTheDocument()
    expect(screen.getByText('mongo')).toBeInTheDocument()
  })

  test('should display input for value', () => {
    render(<AddPropertyDialog {...defaultProps} />)

    fireEvent.click(screen.getByText('Select property'))
    fireEvent.click(screen.getByText('Property: deployment'))

    expect(screen.getByText('Value')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })
})
