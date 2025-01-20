import type {Meta, StoryObj} from '@storybook/react'
import {MemoryRouter} from 'react-router-dom'
import {createMockEnvironment} from 'relay-test-utils'

import {buildMergeAction, buildMergeMethod, buildMergeQueue} from '../../test-utils/query-data'
import {MergeSectionTestComponent as MergeSectionComponent} from '../../test-utils/MergeSectionTestComponent'
import {MergeAction, MergeMethod} from '../../types'
import type {MergeSectionProps} from './merge-section/MergeSection'

const meta: Meta<typeof MergeSectionComponent> = {
  title: 'Pull Requests/mergebox/MergeSection',
  component: MergeSectionComponent,
  decorators: [
    Story => (
      <MemoryRouter>
        <div style={{maxWidth: '800px'}}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
}

type Story = StoryObj<typeof MergeSectionComponent>

export const MergeQueueMergeSection: Story = (function () {
  const environment = createMockEnvironment()
  const pullRequest: MergeSectionProps = {
    autoMergeRequest: null,
    baseRefName: 'main',
    commitAuthor: '',
    commitMessageBody: null,
    commitMessageHeadline: null,
    conflictsCondition: {result: 'PASSED'},
    id: 'pullRequest:1',
    isDraft: false,
    isInMergeQueue: false,
    mergeQueue: buildMergeQueue(),
    mergeRequirementsState: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    numberOfCommits: 1,
    isReadingFromJSONAPI: false,
    viewerCanAddAndRemoveFromMergeQueue: true,
    viewerCanDisableAutoMerge: false,
    viewerCanEnableAutoMerge: false,
    viewerMergeActions: [
      buildMergeAction({
        name: MergeAction.DIRECT_MERGE,
        isAllowable: false,
        mergeMethods: [
          buildMergeMethod({
            name: MergeMethod.MERGE,
            isAllowable: true,
          }),
        ],
      }),
      buildMergeAction({
        name: MergeAction.MERGE_QUEUE,
        isAllowable: true,
        mergeMethods: [
          buildMergeMethod({
            name: MergeMethod.MERGE,
            isAllowable: true,
          }),
        ],
      }),
    ],
  }

  return {
    argTypes: {
      environment: {table: {disable: true}},
    },
    args: {
      environment,
      ...pullRequest,
    },
    render: args => <MergeSectionComponent {...args} />,
  }
})()

export const MergeQueueAutoMergeSection: Story = (function () {
  const environment = createMockEnvironment()
  const pullRequest: MergeSectionProps = {
    autoMergeRequest: null,
    baseRefName: 'main',
    commitAuthor: '',
    commitMessageBody: null,
    commitMessageHeadline: null,
    conflictsCondition: {result: 'PASSED'},
    id: 'pullRequest:2',
    isDraft: false,
    isInMergeQueue: false,
    mergeQueue: buildMergeQueue(),
    mergeRequirementsState: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    numberOfCommits: 1,
    isReadingFromJSONAPI: false,
    viewerCanAddAndRemoveFromMergeQueue: true,
    viewerCanEnableAutoMerge: true,
    viewerCanDisableAutoMerge: false,
    viewerMergeActions: [
      buildMergeAction({
        name: MergeAction.DIRECT_MERGE,
        isAllowable: false,
        mergeMethods: [
          buildMergeMethod({
            name: MergeMethod.MERGE,
            isAllowable: true,
          }),
        ],
      }),
      buildMergeAction({
        name: MergeAction.MERGE_QUEUE,
        isAllowable: true,
        mergeMethods: [
          buildMergeMethod({
            name: MergeMethod.MERGE,
            isAllowable: true,
          }),
        ],
      }),
    ],
  }
  return {
    argTypes: {
      environment: {table: {disable: true}},
    },
    args: {
      environment,
      ...pullRequest,
    },
    render: args => <MergeSectionComponent {...args} />,
  }
})()

export const DirectMergeMergeSection: Story = (function () {
  const environment = createMockEnvironment()
  const pullRequest: MergeSectionProps = {
    autoMergeRequest: null,
    baseRefName: 'main',
    commitAuthor: '',
    commitMessageBody: null,
    commitMessageHeadline: null,
    conflictsCondition: {result: 'PASSED'},
    id: 'pullRequest:3',
    isDraft: false,
    isInMergeQueue: false,
    mergeQueue: null,
    mergeRequirementsState: 'MERGEABLE',
    mergeStateStatus: 'CLEAN',
    numberOfCommits: 1,
    isReadingFromJSONAPI: false,
    viewerCanAddAndRemoveFromMergeQueue: false,
    viewerCanEnableAutoMerge: false,
    viewerCanDisableAutoMerge: false,
    viewerMergeActions: [
      buildMergeAction({
        name: MergeAction.DIRECT_MERGE,
        isAllowable: true,
        mergeMethods: [
          buildMergeMethod({
            name: MergeMethod.MERGE,
            isAllowable: true,
          }),
          buildMergeMethod({
            name: MergeMethod.SQUASH,
            isAllowable: true,
          }),
          buildMergeMethod({
            name: MergeMethod.REBASE,
            isAllowable: true,
          }),
        ],
      }),
    ],
  }

  return {
    argTypes: {
      environment: {table: {disable: true}},
    },
    args: {
      environment,
      ...pullRequest,
    },
    render: args => <MergeSectionComponent {...args} />,
  }
})()

export const DirectMergeMergeSectionUnmergeable: Story = (function () {
  const environment = createMockEnvironment()
  const pullRequest: MergeSectionProps = {
    autoMergeRequest: null,
    baseRefName: 'main',
    commitAuthor: '',
    commitMessageBody: null,
    commitMessageHeadline: null,
    conflictsCondition: {result: 'PASSED'},
    id: 'pullRequest:4',
    isDraft: false,
    isInMergeQueue: false,
    mergeQueue: null,
    mergeRequirementsState: 'UNMERGEABLE',
    mergeStateStatus: 'BLOCKED',
    numberOfCommits: 1,
    isReadingFromJSONAPI: false,
    viewerCanAddAndRemoveFromMergeQueue: false,
    viewerCanDisableAutoMerge: false,
    viewerCanEnableAutoMerge: false,
    viewerMergeActions: [
      buildMergeAction({
        name: MergeAction.DIRECT_MERGE,
        isAllowable: true,
        mergeMethods: [
          buildMergeMethod({
            name: MergeMethod.MERGE,
            isAllowable: true,
          }),
          buildMergeMethod({
            name: MergeMethod.SQUASH,
            isAllowable: true,
          }),
          buildMergeMethod({
            name: MergeMethod.REBASE,
            isAllowable: true,
          }),
        ],
      }),
    ],
  }

  return {
    argTypes: {
      environment: {table: {disable: true}},
    },
    args: {
      environment,
      ...pullRequest,
    },
    render: args => <MergeSectionComponent {...args} />,
  }
})()

export const DirectMergeOneMergeMethodSection: Story = (function () {
  const environment = createMockEnvironment()
  const pullRequest: MergeSectionProps = {
    autoMergeRequest: null,
    baseRefName: 'main',
    numberOfCommits: 1,
    id: 'pullRequest:5',
    isDraft: false,
    isInMergeQueue: false,
    mergeQueue: null,
    mergeRequirementsState: 'MERGEABLE',
    commitAuthor: '',
    commitMessageBody: null,
    commitMessageHeadline: null,
    conflictsCondition: {result: 'PASSED'},
    mergeStateStatus: 'CLEAN',
    isReadingFromJSONAPI: false,
    viewerCanAddAndRemoveFromMergeQueue: false,
    viewerCanEnableAutoMerge: false,
    viewerCanDisableAutoMerge: false,
    viewerMergeActions: [
      buildMergeAction({
        name: MergeAction.DIRECT_MERGE,
        isAllowable: true,
        mergeMethods: [
          buildMergeMethod({
            name: MergeMethod.MERGE,
            isAllowable: true,
          }),
          buildMergeMethod({
            name: MergeMethod.SQUASH,
            isAllowable: false,
          }),
          buildMergeMethod({
            name: MergeMethod.REBASE,
            isAllowable: false,
          }),
        ],
      }),
    ],
  }

  return {
    argTypes: {
      environment: {table: {disable: true}},
      pullRequest: {table: {disable: true}},
    },
    args: {
      environment,
      ...pullRequest,
    },
    render: args => <MergeSectionComponent {...args} />,
  }
})()

export default meta
