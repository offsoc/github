import {render} from '@github-ui/react-core/test-utils'

import {useNestedListViewProperties} from '../context/PropertiesContext'
import {useNestedListViewTitle} from '../context/TitleContext'

describe('context', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('useDescription', () => {
    it('throws an error when used outside of PropertiesProvider', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useNestedListViewProperties()).toThrow(
          'useNestedListViewProperties must be used with PropertiesProvider.',
        )
        return null
      }

      render(<TestComponent />)
    })
  })
})

describe('useNestedListViewTitle', () => {
  it('throws an error when used outside of TitleProvider', () => {
    function TestComponent() {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      expect(() => useNestedListViewTitle()).toThrow('useNestedListViewTitle must be used with TitleProvider.')
      return null
    }

    render(<TestComponent />)
  })
})
