import type {Meta, StoryObj} from '@storybook/react'

import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../../../contexts/FilesPageInfoContext'
import type {RefInfo} from '@github-ui/repos-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {CurrentTreeProvider} from '../../../../contexts/CurrentTreeContext'
import {DirectoryContent} from '../DirectoryContent'
import type {DirectoryItem} from '@github-ui/code-view-types'
import {createRepository} from '@github-ui/current-repository/test-helpers'

const meta = {
  title: 'Apps/Code View Shared/DirectoryContent',
  component: DirectoryContent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof DirectoryContent>

export default meta

const defaultArgs = {
  refInfo: {
    name: 'main',
    listCacheKey: 'key',
    refType: 'branch',
    canEdit: true,
    currentOid: '1234',
  } as RefInfo,
  repo: createRepository({
    id: 1,
    name: 'test-repo',
    ownerLogin: 'owner',
    defaultBranch: 'main',
    createdAt: '2021-10-01T00:00:00Z',
    currentUserCanPush: true,
    isFork: false,
    isEmpty: false,
    ownerAvatar: 'www.github.com/avatar',
    public: true,
    private: false,
    isOrgOwned: false,
  }),
  path: '/test/path',
  payload: {
    items: [
      {
        name: 'folder',
        contentType: 'directory',
        path: '/test/path/folder',
      } as DirectoryItem,
      {
        name: 'file',
        contentType: 'file',
        path: '/test/path/file',
      } as DirectoryItem,
    ],
    readme: undefined,
    totalCount: 2,
    showBranchInfobar: false,
  },
}

type Story = StoryObj<typeof DirectoryContent>

export const Default: Story = {
  render: () => (
    <Wrapper appPayload={{helpUrl: ''}}>
      <CurrentRepositoryProvider repository={defaultArgs.repo}>
        <FilesPageInfoProvider
          refInfo={defaultArgs.refInfo}
          path={defaultArgs.path}
          action="tree"
          copilotAccessAllowed={false}
        >
          <CurrentTreeProvider payload={defaultArgs.payload}>
            <DirectoryContent />
          </CurrentTreeProvider>
        </FilesPageInfoProvider>
      </CurrentRepositoryProvider>
    </Wrapper>
  ),
}
