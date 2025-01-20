import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {RelayEnvironmentProvider} from 'react-relay'
import React from 'react'
import type {createMockEnvironment} from 'relay-test-utils'
import {
  IssueTypePicker,
  DefaultIssueTypeAnchor,
  type IssueType,
  type IssueTypePickerProps,
} from '../components/IssueTypePicker'
import {noop} from '@github-ui/noop'

export type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
} & Omit<IssueTypePickerProps, 'onSelectionChange' | 'anchorElement' | 'owner' | 'repo' | 'activeIssueType'>

export function TestIssueTypePickerComponent({environment, ...props}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="...Loading">
        <Component {...props} />
      </React.Suspense>
    </RelayEnvironmentProvider>
  )
}

function Component(props: Omit<TestComponentProps, 'environment'>) {
  return (
    <IssueTypePicker
      onSelectionChange={noop}
      anchorElement={anchorProps => (
        <DefaultIssueTypeAnchor activeIssueType={null} anchorProps={anchorProps} {...props} />
      )}
      owner="github"
      repo="issues"
      activeIssueType={null}
      {...props}
    />
  )
}

export function buildIssueType({name, color, description}: Pick<IssueType, 'name' | 'color' | 'description'>) {
  return {
    id: mockRelayId(),
    name,
    color,
    description,
    __typename: 'IssueType',
  }
}
