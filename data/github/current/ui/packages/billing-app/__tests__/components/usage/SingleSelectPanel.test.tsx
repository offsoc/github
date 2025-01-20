import {useRef} from 'react'
import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import {CUSTOMER_SELECTIONS, DEFAULT_FILTERS} from '../../../test-utils/mock-data'

import {SingleSelectPanel} from '../../../components/usage'

describe('SingleSelectPanel', () => {
  test('renders select panel', () => {
    const TestComponent: React.FC = () => {
      const ref = useRef<HTMLButtonElement>(null)
      return (
        <SingleSelectPanel
          anchorRef={ref}
          open
          setOpen={() => {}}
          setSelectedCustomer={() => {}}
          selectedCustomer={DEFAULT_FILTERS.customer}
          menuItems={CUSTOMER_SELECTIONS}
          filtersSavedState={DEFAULT_FILTERS}
          setFilters={() => {}}
          manageCostCentersLink=""
        />
      )
    }

    render(<TestComponent />)

    expect(screen.getByTestId('single-select-panel-header')).toBeVisible()
    expect(screen.getByTestId('single-select-panel-footer-link')).toBeVisible()
    expect(screen.getByTestId('single-select-panel-search-input')).toBeVisible()
    const panelList = screen.getByTestId('single-select-panel-list')
    expect(panelList).toBeVisible()
    const listItem = panelList.childNodes[0]
    expect(listItem).toHaveTextContent('Metered usage')
  })
})
