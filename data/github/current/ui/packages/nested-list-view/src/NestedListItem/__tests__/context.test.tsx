import {render} from '@github-ui/react-core/test-utils'

import {useNestedListItemDescription} from '../context/DescriptionContext'
import {useNestedListItemLeadingBadge} from '../context/LeadingBadgeContext'
import {useNestedListItemNewActivity} from '../context/NewActivityContext'
import {useNestedListItemStatus} from '../context/StatusContext'
import {useNestedListItemTitle} from '../context/TitleContext'

describe('context', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('useNestedListItemDescription', () => {
    it('throws an error when used outside of NestedListItemDescriptionProvider', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useNestedListItemDescription()).toThrow(
          'useNestedListItemDescription must be used with NestedListItemDescriptionProvider.',
        )
        return null
      }

      render(<TestComponent />)
    })
  })

  describe('useNestedListItemLeadingBadge', () => {
    it('throws an error when used outside of NestedListItemLeadingBadgeProvider', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useNestedListItemLeadingBadge()).toThrow(
          'useNestedListItemLeadingBadge must be used with NestedListItemLeadingBadgeProvider.',
        )
        return null
      }

      render(<TestComponent />)
    })
  })

  describe('useNestedListItemNewActivity', () => {
    it('throws an error when used outside of NewActivityProvider', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useNestedListItemNewActivity()).toThrow(
          'useNestedListItemNewActivity must be used with NewActivityProvider.',
        )
        return null
      }

      render(<TestComponent />)
    })
  })

  describe('useNestedListItemStatus', () => {
    it('throws an error when used outside of NestedListItemStatusProvider', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useNestedListItemStatus()).toThrow(
          'useNestedListItemStatus must be used with NestedListItemStatusProvider.',
        )
        return null
      }

      render(<TestComponent />)
    })
  })

  describe('useNestedListItemTitle', () => {
    it('throws an error when used outside of NestedListItemTitleProvider', () => {
      function TestComponent() {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        expect(() => useNestedListItemTitle()).toThrow(
          'useNestedListItemTitle must be used with NestedListItemTitleProvider.',
        )
        return null
      }

      render(<TestComponent />)
    })
  })
})
