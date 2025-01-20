import type {PropertyDefinition, PropertyValuesRecord} from '@github-ui/custom-properties-types'
import {screen, within} from '@testing-library/react'
import type {ComponentProps} from 'react'

import {renderPropertyDefinitionsComponent} from '../../test-utils/Render'
import {RepoPropertiesList} from '../RepoPropertiesList'

const definitions = [
  {
    propertyName: 'env',
    valueType: 'single_select',
  },
  {
    propertyName: 'team',
    valueType: 'string',
  },
  {
    propertyName: 'no_value_def',
    valueType: 'single_select',
  },
] as PropertyDefinition[]

const values: PropertyValuesRecord = {
  env: 'prod',
  team: 'sales',
}

const editClickMock = jest.fn()
const sampleProps: ComponentProps<typeof RepoPropertiesList> = {
  definitions,
  values,
}

beforeEach(() => {
  editClickMock.mockClear()
})

describe('RepoPropertiesList', () => {
  it('shows empty state when no definitions', () => {
    renderPropertyDefinitionsComponent(<RepoPropertiesList {...sampleProps} definitions={[]} />)

    expect(screen.getByText('No custom properties set for this repository.')).toBeInTheDocument()
  })

  it('renders properties and values', () => {
    renderPropertyDefinitionsComponent(<RepoPropertiesList {...sampleProps} />)

    const [envRow, teamRow, noValueRow] = screen.getAllByTestId('property-row')

    expect(within(envRow!).getByText('env')).toBeInTheDocument()
    expect(within(envRow!).getByText('prod')).toBeInTheDocument()

    expect(within(teamRow!).getByText('team')).toBeInTheDocument()
    expect(within(teamRow!).getByText('sales')).toBeInTheDocument()

    expect(within(noValueRow!).getByText('no_value_def')).toBeInTheDocument()
    expect(within(noValueRow!).getByText('(Empty)')).toBeInTheDocument()
  })

  it('filters by property name', async () => {
    const {user} = renderPropertyDefinitionsComponent(<RepoPropertiesList {...sampleProps} />)

    const input = screen.getByRole('textbox')

    expect(screen.getByText('env')).toBeInTheDocument()
    expect(screen.getByText('team')).toBeInTheDocument()

    await user.type(input, 'env')

    expect(screen.getByText('env')).toBeInTheDocument()
    expect(screen.queryByText('team')).not.toBeInTheDocument()

    await user.clear(input)
    expect(screen.getByText('env')).toBeInTheDocument()
    expect(screen.getByText('team')).toBeInTheDocument()

    await user.type(input, 'unknown')

    expect(screen.queryByText('env')).not.toBeInTheDocument()
    expect(screen.queryByText('team')).not.toBeInTheDocument()
    expect(screen.getByText('No properties that match')).toBeInTheDocument()
  })
})
