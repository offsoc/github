import type {Meta, StoryObj} from '@storybook/react'

import {CurrentRepositoryProvider} from '@github-ui/current-repository'
import {FilesPageInfoProvider} from '../../contexts/FilesPageInfoContext'
import type {RefInfo} from '@github-ui/repos-types'
import {Wrapper} from '@github-ui/react-core/test-utils'
import {CodeViewError} from '../CodeViewError'
import type {PageError} from '@github-ui/react-core/app-routing-types'
import {createRepository} from '@github-ui/current-repository/test-helpers'

const meta = {
  title: 'Apps/Code View Shared/CodeViewError',
  component: CodeViewError,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof CodeViewError>

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
  error: {
    httpStatus: 500,
    type: 'httpError',
  } as PageError,
}

type Story = StoryObj<typeof CodeViewError>

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
          <CodeViewError {...defaultArgs.error} />
        </FilesPageInfoProvider>
      </CurrentRepositoryProvider>
    </Wrapper>
  ),
}
