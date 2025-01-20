import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderRelay} from '@github-ui/relay-test-utils'
import {act, screen} from '@testing-library/react'

import {FilteredFilesContextProvider} from '../../../contexts/FilteredFilesContext'
import type {FileFilterQuery} from '../__generated__/FileFilterQuery.graphql'
import {FileFilterWithQuery} from '../FileFilter'

describe('FileFilter', () => {
  test('Renders the sorted file extensions provided from the context provider', () => {
    renderRelay<{fileFilterQuery: FileFilterQuery}>(
      () => <FileFilterWithQuery routeInfo={{number: 1, owner: 'monalisa', repo: 'smile'}} />,
      {
        relay: {
          queries: {
            fileFilterQuery: {
              type: 'lazy',
            },
          },
          mockResolvers: {
            Repository() {
              return {
                pullRequest: {
                  comparison: {summary: [{path: 'something.js'}, {path: 'something.rb'}, {path: 'something.py'}]},
                },
              }
            },
          },
        },
        wrapper: ({children}) => (
          <Wrapper>
            <FilteredFilesContextProvider>{children}</FilteredFilesContextProvider>
          </Wrapper>
        ),
      },
    )

    const filterButton = screen.getByLabelText('Filter')
    act(() => {
      filterButton.click()
    })

    const listItems = screen.getAllByRole('menuitemcheckbox')
    expect(listItems.length).toBe(3)
    expect(listItems[0]?.textContent).toBe('.js')
    expect(listItems[1]?.textContent).toBe('.py')
    expect(listItems[2]?.textContent).toBe('.rb')
  })

  test('Handles duplicate file extensions', () => {
    renderRelay<{fileFilterQuery: FileFilterQuery}>(
      () => <FileFilterWithQuery routeInfo={{number: 1, owner: 'monalisa', repo: 'smile'}} />,
      {
        relay: {
          queries: {
            fileFilterQuery: {
              type: 'lazy',
            },
          },
          mockResolvers: {
            Repository() {
              return {
                pullRequest: {
                  comparison: {summary: [{path: 'something.js'}, {path: 'something1.js'}, {path: 'something2.py'}]},
                },
              }
            },
          },
        },
        wrapper: ({children}) => (
          <Wrapper>
            <FilteredFilesContextProvider>{children}</FilteredFilesContextProvider>
          </Wrapper>
        ),
      },
    )

    const filterButton = screen.getByLabelText('Filter')
    act(() => {
      filterButton.click()
    })

    const listItems = screen.getAllByRole('menuitemcheckbox')
    expect(listItems.length).toBe(2)
    expect(listItems[0]?.textContent).toBe('.js')
    expect(listItems[1]?.textContent).toBe('.py')
  })

  test('shows viewed menu item and only files owned by you menu items', () => {
    renderRelay<{fileFilterQuery: FileFilterQuery}>(
      () => <FileFilterWithQuery routeInfo={{number: 1, owner: 'monalisa', repo: 'smile'}} />,
      {
        relay: {
          queries: {
            fileFilterQuery: {
              type: 'lazy',
            },
          },
          mockResolvers: {
            Repository() {
              return {
                pullRequest: {
                  comparison: {summary: [{path: 'something.js'}]},
                },
              }
            },
          },
        },
        wrapper: ({children}) => (
          <Wrapper>
            <FilteredFilesContextProvider>{children}</FilteredFilesContextProvider>
          </Wrapper>
        ),
      },
    )
    const filterButton = screen.getByLabelText('Filter')
    act(() => {
      filterButton.click()
    })

    const listItems = screen.getAllByRole('menuitemradio')
    expect(listItems.length).toBe(2)
    expect(listItems[0]?.textContent).toBe('Show viewed')
    expect(listItems[1]?.textContent).toBe('Only files owned by you')
  })
})
