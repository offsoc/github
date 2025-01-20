import {act, screen} from '@testing-library/react'
// eslint-disable-next-line unused-imports/no-unused-imports
import React from 'react'

import {render} from '../../../../test-utils/Render'
import type {Sort} from '../SortHeader'
import SortHeader from '../SortHeader'

describe('SortHeader', () => {
  interface TestRow {
    foo: string
    bar: number
  }

  describe('when sorted by another field', () => {
    it('should render without icon', () => {
      render(
        <SortHeader
          field="foo"
          sort={{
            field: 'bar',
            direction: 'asc',
          }}
          onSortChange={(_: Sort<TestRow>): void => {}}
        >
          My column header
        </SortHeader>,
      )

      expect(screen.getByText('My column header')).toBeInTheDocument()
      expect(screen.getByTestId('sort-button')).toBeInTheDocument()
      expect(screen.queryByTestId('sort-icon-asc')).not.toBeInTheDocument()
      expect(screen.queryByTestId('sort-icon-desc')).not.toBeInTheDocument()
    })

    it('should raise event to sort desc', () => {
      const onSortChange = jest.fn()
      render(
        <SortHeader
          field="foo"
          sort={{
            field: 'bar',
            direction: 'asc',
          }}
          onSortChange={onSortChange}
        >
          My column header
        </SortHeader>,
      )

      const button = screen.getByTestId('sort-button')
      expect(button).toBeInTheDocument()

      act(() => button.click())
      expect(onSortChange).toHaveBeenCalledTimes(1)
      expect(onSortChange).toHaveBeenCalledWith({field: 'foo', direction: 'desc'})
    })
  })

  describe('when sorted asc', () => {
    it('should render with asc icon', () => {
      render(
        <SortHeader
          field="foo"
          sort={{
            field: 'foo',
            direction: 'asc',
          }}
          onSortChange={(_: Sort<TestRow>): void => {}}
        >
          My column header
        </SortHeader>,
      )

      expect(screen.getByText('My column header')).toBeInTheDocument()
      expect(screen.getByTestId('sort-icon-asc')).toBeInTheDocument()
      expect(screen.queryByTestId('sort-icon-desc')).not.toBeInTheDocument()
    })

    it('should raise event to sort desc', () => {
      const onSortChange = jest.fn()
      render(
        <SortHeader
          field="foo"
          sort={{
            field: 'foo',
            direction: 'asc',
          }}
          onSortChange={onSortChange}
        >
          My column header
        </SortHeader>,
      )

      const button = screen.getByTestId('sort-button')
      expect(button).toBeInTheDocument()

      act(() => button.click())
      expect(onSortChange).toHaveBeenCalledTimes(1)
      expect(onSortChange).toHaveBeenCalledWith({field: 'foo', direction: 'desc'})
    })
  })

  describe('when sorted desc', () => {
    it('should render with desc icon', () => {
      render(
        <SortHeader
          field="foo"
          sort={{
            field: 'foo',
            direction: 'desc',
          }}
          onSortChange={(_: Sort<TestRow>): void => {}}
        >
          My column header
        </SortHeader>,
      )

      expect(screen.getByText('My column header')).toBeInTheDocument()
      expect(screen.getByTestId('sort-icon-desc')).toBeInTheDocument()
      expect(screen.queryByTestId('sort-icon-asc')).not.toBeInTheDocument()
    })

    it('should raise event to sort asc', () => {
      const onSortChange = jest.fn()
      render(
        <SortHeader
          field="foo"
          sort={{
            field: 'foo',
            direction: 'desc',
          }}
          onSortChange={onSortChange}
        >
          My column header
        </SortHeader>,
      )

      const button = screen.getByTestId('sort-button')
      expect(button).toBeInTheDocument()

      act(() => button.click())
      expect(onSortChange).toHaveBeenCalledTimes(1)
      expect(onSortChange).toHaveBeenCalledWith({field: 'foo', direction: 'asc'})
    })
  })
})
