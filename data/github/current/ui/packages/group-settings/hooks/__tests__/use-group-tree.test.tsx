import type {PropsWithChildren} from 'react'
import {renderHook} from '@testing-library/react'

import {useGroupTree} from '../use-group-tree'
import {getGroups} from '../../test-utils/mock-data'

import {OrganizationProvider} from '../../contexts/OrganizationContext'

describe('useGroupTree', () => {
  test('creates a tree given an array of groups', async () => {
    const wrapper = ({children}: PropsWithChildren) => (
      <OrganizationProvider organization={{name: 'repos-settings'}}>{children}</OrganizationProvider>
    )
    const {
      result: {current},
    } = renderHook(() => useGroupTree(getGroups()), {wrapper})
    expect(current.tree).toEqual({
      id: 1,
      total_count: 100,
      nodes: {
        'repos-settings': {
          id: 1,
          repos: [{name: 'root', id: 1}],
          total_count: 100,
          nodes: {
            Canada: {
              id: 2,
              repos: [{name: 'canada', id: 2}],
              total_count: 30,
              nodes: {
                blue: {
                  id: 3,
                  repos: [{name: 'canada-blue', id: 3}],
                  total_count: 10,
                },
              },
            },
            USA: {
              id: 4,
              repos: [{name: 'usa', id: 4}],
              total_count: 100,
              nodes: {
                green: {
                  id: 5,
                  repos: [{name: 'usa-green', id: 5}],
                  total_count: 15,
                  nodes: {
                    fish: {
                      id: 6,
                      repos: [{name: 'usa-green-fish', id: 6}],
                      total_count: 2,
                    },
                  },
                },
              },
            },
            Mexico: {
              id: 7,
              repos: [{name: 'mexico', id: 7}],
              total_count: 30,
            },
          },
        },
      },
    })
  })
})
