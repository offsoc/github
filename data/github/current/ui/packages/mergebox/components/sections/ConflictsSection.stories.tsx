import type {Meta, StoryObj} from '@storybook/react'
import {MemoryRouter} from 'react-router-dom'

import {
  conflictsSectionCleanMergeState,
  conflictsSectionComplexConflictsMergeState,
  conflictsSectionPendingMergeState,
  conflictsSectionStandardConflictsMergeState,
} from '../../test-utils/query-data'
import {ConflictsSection, type ConflictsSectionProps, type UpdateBranchFunction} from './ConflictsSection'
import {AppContext} from '@github-ui/react-core/app-context'
import {jsonRoute} from '@github-ui/react-core/json-route'
import {createBrowserHistory} from '@github-ui/react-core/create-browser-history'

const conflictsSectionDefaultProps: ConflictsSectionProps & StoryProps = {
  ...conflictsSectionCleanMergeState,
  baseRefName: 'main',
  resourcePath: '/octocat/Hello-World/pull/123',
  viewerCanUpdateBranch: true,
  viewerLogin: 'monalisa',
  updateBranchState: 'SUCCESS',
  onUpdateBranch: () => {},
}

const meta: Meta<ConflictsSectionProps & StoryProps> = {
  title: 'Pull Requests/mergebox/ConflictsSection',
  component: ConflictsSection,
  decorators: [
    Story => (
      <MemoryRouter>
        <AppContext.Provider
          value={{
            routes: [jsonRoute({path: '/a', Component: () => null})],
            history: createBrowserHistory(),
          }}
        >
          <div style={{maxWidth: '600px'}}>
            <Story />
          </div>
        </AppContext.Provider>
      </MemoryRouter>
    ),
  ],
  args: conflictsSectionDefaultProps,
  argTypes: {
    updateBranchState: {options: ['SUCCESS', 'PENDING', 'ERROR'], control: 'radio'},
  },
}

type StoryProps = {
  updateBranchState: 'SUCCESS' | 'PENDING' | 'ERROR'
}
type Story = StoryObj<ConflictsSectionProps & StoryProps>

const handleSuccessfulUpdateBranch: UpdateBranchFunction = ({onCompleted}) => {
  onCompleted()
}

const handleUnsuccessfulUpdateBranch: UpdateBranchFunction = ({onError}) => {
  onError()
}

function setOnUpdateBranch(updateBranchState: 'SUCCESS' | 'PENDING' | 'ERROR') {
  switch (updateBranchState) {
    case 'SUCCESS':
      return handleSuccessfulUpdateBranch
    case 'PENDING':
      return () => {}
    case 'ERROR':
      return handleUnsuccessfulUpdateBranch
  }
}

export const ConflictsSectionCleanStory: Story = {
  render: ({updateBranchState, ...args}: StoryProps) => {
    const props = {
      ...conflictsSectionDefaultProps,
      ...args,
      ...conflictsSectionCleanMergeState,
      onUpdateBranch: setOnUpdateBranch(updateBranchState),
    }
    return <ConflictsSection {...props} />
  },
}

export const ConflictsSectionPendingStory: Story = {
  render: ({updateBranchState, ...args}: StoryProps) => {
    const props = {
      ...conflictsSectionDefaultProps,
      ...args,
      ...conflictsSectionPendingMergeState,
      onUpdateBranch: setOnUpdateBranch(updateBranchState),
    }
    return <ConflictsSection {...props} />
  },
}

export const ConflictsSectionHasConflictsStory: Story = {
  render: ({updateBranchState, ...args}: StoryProps) => {
    const props = {
      ...conflictsSectionDefaultProps,
      ...args,
      ...conflictsSectionStandardConflictsMergeState,
      onUpdateBranch: setOnUpdateBranch(updateBranchState),
    }
    return <ConflictsSection {...props} />
  },
}

export const ConflictsSectionComplexConflictsStory: Story = {
  render: ({updateBranchState, ...args}: StoryProps) => {
    const props = {
      ...conflictsSectionDefaultProps,
      ...args,
      ...conflictsSectionComplexConflictsMergeState,
      onUpdateBranch: setOnUpdateBranch(updateBranchState),
    }
    return <ConflictsSection {...props} />
  },
}

export default meta
