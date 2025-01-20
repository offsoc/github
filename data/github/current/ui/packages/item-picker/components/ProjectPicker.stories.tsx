import type {Meta} from '@storybook/react'
import {createMockEnvironment, MockPayloadGenerator} from 'relay-test-utils'
import type {OperationDescriptor} from 'relay-runtime'
import {TestProjectPickerComponent, buildProject} from '../test-utils/ProjectPickerHelpers'
import {ProjectPickerGraphqlQuery} from '../components/ProjectPicker'

type TestProjectPickerProps = React.ComponentProps<typeof TestProjectPickerComponent>

const environment = createMockEnvironment()

const meta = {
  title: 'ItemPicker/ProjectPicker',
  component: TestProjectPickerComponent,
} satisfies Meta<typeof TestProjectPickerComponent>

export default meta

const args = {
  environment,
  shortcutEnabled: true,
  readonly: false,
} satisfies TestProjectPickerProps

export const Example = {
  args,
  play: () => {
    environment.mock.queuePendingOperation(ProjectPickerGraphqlQuery, {owner: 'github', repo: 'issues'})
    environment.mock.queueOperationResolver((operation: OperationDescriptor) => {
      return MockPayloadGenerator.generate(operation, {
        Repository() {
          return {
            projectsV2: {
              nodes: [
                buildProject({title: 'projectA', closed: false}),
                buildProject({title: 'projectB', closed: false}),
              ],
            },
            recentProjects: {edges: []},
            owner: {
              projectsV2: {edges: []},
              recentProjects: {edges: []},
            },
          }
        },
      })
    })
  },
}
