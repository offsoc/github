import type {DirectoryItem} from '@github-ui/code-view-types'
import {AppContext} from '@github-ui/react-core/app-context'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'
import type {Meta, StoryObj} from '@storybook/react'
// eslint-disable-next-line unused-imports/no-unused-imports
import React from 'react'
import {MemoryRouter} from 'react-router-dom'

import {buildTreeComponent} from '../__tests__/test-utils'
import {ReposFileTreeView} from './ReposFileTreeView'

const meta = {
  title: 'Apps/ReposFileTreeView',
  component: ReposFileTreeView,
} satisfies Meta<typeof ReposFileTreeView>

export default meta

type Story = StoryObj

const src: DirectoryItem = {
  name: 'src',
  contentType: 'directory',
  hasSimplifiedPath: false,
  path: 'src',
  totalCount: 1,
}

export const Base: Story = {
  render: () => {
    return (
      <AppContext.Provider
        value={{
          routes: [],
          history: createBrowserHistory(),
        }}
      >
        <MemoryRouter>
          {buildTreeComponent(
            {
              '': {
                items: [src],
                totalCount: 1,
              },
            },
            'another/folder',
          )}
        </MemoryRouter>
      </AppContext.Provider>
    )
  },
}
