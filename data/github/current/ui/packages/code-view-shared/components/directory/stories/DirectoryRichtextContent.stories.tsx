import type {Meta, StoryObj} from '@storybook/react'

import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import type {SafeHTMLString} from '@github-ui/safe-html'
import {DirectoryRichtextContent} from '../DirectoryRichtextContent'
import {FilesPageInfoProvider} from '../../../contexts/FilesPageInfoContext'
import type {RefInfo} from '@github-ui/repos-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {createRepository} from '@github-ui/current-repository/test-helpers'

const meta = {
  title: 'Apps/Code View Shared/DirectoryRichtextContent',
  component: DirectoryRichtextContent,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof DirectoryRichtextContent>

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
  errorMessage: undefined,
  onAnchorClick: () => {},
  richText: 'This is a test' as SafeHTMLString,
  stickyHeaderHeight: 0,
  path: '/test/path',
  timedOut: false,
}

type Story = StoryObj<typeof DirectoryRichtextContent>

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
          <DirectoryRichtextContent
            errorMessage={defaultArgs.errorMessage}
            onAnchorClick={defaultArgs.onAnchorClick}
            path={defaultArgs.path}
            richText={defaultArgs.richText}
            stickyHeaderHeight={defaultArgs.stickyHeaderHeight}
            timedOut={defaultArgs.timedOut}
          />
        </FilesPageInfoProvider>
      </CurrentRepositoryProvider>
    </Wrapper>
  ),
}
