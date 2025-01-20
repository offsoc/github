import {fireEvent, screen} from '@testing-library/react'
import {CostCenterPicker} from '../../../components/pickers/CostCenterPicker'
import {render} from '@github-ui/react-core/test-utils'

// Ensures expected cost centers are displayed when filtering
jest.mock('../../../hooks/cost_centers/use-cost-centers-page', () => ({
  __esModule: true,
  default: () => ({
    costCenters: [
      {
        costCenterKey: {
          customerId: 'customer1',
          targetType: 'Project',
          targetId: 'project1',
          uuid: 'uuid1',
        },
        name: 'Cost Center 1',
        resources: [
          {id: 'resource1', type: 'VM'},
          {id: 'resource2', type: 'Storage'},
        ],
        costCenterState: 'Active',
      },
      {
        costCenterKey: {
          customerId: 'customer2',
          targetType: 'Department',
          targetId: 'dept1',
          uuid: 'uuid2',
        },
        name: 'Cost Center 2',
        resources: [
          {id: 'resource3', type: 'VM'},
          {id: 'resource4', type: 'Network'},
        ],
        costCenterState: 'Inactive',
      },
      {
        costCenterKey: {
          customerId: 'customer3',
          targetType: 'Team',
          targetId: 'team1',
          uuid: 'uuid3',
        },
        name: 'Cost Center 3',
        resources: [
          {id: 'resource5', type: 'Application'},
          {id: 'resource6', type: 'Database'},
        ],
        costCenterState: 'Active',
      },
    ],
  }),
}))

// Simple search filtering tests
describe('CostCenterPicker tests for filtering', () => {
  function setupPicker() {
    render(
      <CostCenterPicker setAllSelectedCostCenters={() => {}} initialSelectedItems={[]} selectionVariant="single" />,
    )
  }

  beforeEach(setupPicker)

  test('Displays all cost centers on empty query', async () => {
    fireEvent.click(screen.getByRole('button', {name: /select cost center/i}))

    const textbox = await screen.findByRole('textbox')

    fireEvent.change(textbox, {target: {value: ''}})

    const suggestions = await screen.findAllByRole('option')
    expect(suggestions.length).toBe(3)
  })

  test('Displays correct suggestions while typing', async () => {
    fireEvent.click(screen.getByRole('button', {name: /select cost center/i}))

    const textbox = await screen.findByRole('textbox')

    fireEvent.change(textbox, {target: {value: 'Cost Center 1'}})

    const suggestions = await screen.findAllByRole('option')
    expect(suggestions.length).toBe(1)
    expect(suggestions[0]).toHaveTextContent('Cost Center 1')
  })

  test('Displays all centers when query is found in all', async () => {
    fireEvent.click(screen.getByRole('button', {name: /select cost center/i}))

    const textbox = await screen.findByRole('textbox')

    // Center is found in all cost centers, all should be displayed
    fireEvent.change(textbox, {target: {value: 'Center'}})

    const suggestions = await screen.findAllByRole('option')
    expect(suggestions.length).toBe(3)
  })
})
