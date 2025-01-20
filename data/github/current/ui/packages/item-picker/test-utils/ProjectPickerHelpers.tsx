import {mockRelayId} from '@github-ui/relay-test-utils/RelayComponents'
import {RelayEnvironmentProvider} from 'react-relay'
import React from 'react'
import type {createMockEnvironment} from 'relay-test-utils'
import {DefaultProjectPickerAnchor, ProjectPicker} from '../components/ProjectPicker'
import {noop} from '@github-ui/noop'
import type {ProjectPickerProject$data} from '../components/__generated__/ProjectPickerProject.graphql'
import type {ProjectPickerClassicProject$data} from '../components/__generated__/ProjectPickerClassicProject.graphql'

type MockProjectPickerProject =
  | Omit<ProjectPickerProject$data, ' $fragmentType'>
  | Omit<ProjectPickerClassicProject$data, ' $fragmentType'>

export type TestComponentProps = {
  environment: ReturnType<typeof createMockEnvironment>
  shortcutEnabled: boolean
  readonly: boolean
  selectedProjects?: MockProjectPickerProject[]
  includeClassicProjects?: boolean
  firstSelectedProjectTitle?: string
}

export function TestProjectPickerComponent({
  environment,
  includeClassicProjects = false,
  ...props
}: TestComponentProps) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      <React.Suspense fallback="...Loading">
        <Component {...props} includeClassicProjects={includeClassicProjects} />
      </React.Suspense>
    </RelayEnvironmentProvider>
  )
}

function Component(props: Omit<TestComponentProps, 'environment'>) {
  const {selectedProjects} = props

  return (
    <ProjectPicker
      anchorElement={anchorProps => <DefaultProjectPickerAnchor {...props} anchorProps={anchorProps} />}
      pickerId={'test'}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectedProjects={(selectedProjects as any) ?? []}
      onSave={noop}
      owner={'github'}
      repo={'issues'}
      {...props}
    />
  )
}

export function buildProject({title, closed}: {title: string; closed: boolean}) {
  return {
    id: mockRelayId(),
    title,
    closed,
    __typename: 'ProjectV2' as const,
    number: 123,
    url: 'memex_url',
    viewerCanUpdate: true,
  }
}

export function buildClassicProject({
  title,
  closed,
  columns,
}: {
  title: string
  closed: boolean
  columns?: Array<{name: string; id: string}>
}) {
  return {
    id: mockRelayId(),
    title,
    closed,
    __typename: 'Project' as const,
    number: 123,
    url: 'classic_url',
    viewerCanUpdate: true,
    columns: {
      nodes: columns ?? [
        {name: 'columnA', id: mockRelayId()},
        {name: 'columnB', id: mockRelayId()},
      ],
    },
  }
}
