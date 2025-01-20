import type {Meta} from '@storybook/react'
import FileRendererBlob from './FileRendererBlob'

const meta = {
  title: 'Recipes/FileRendererBlob',
  component: FileRendererBlob,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof FileRendererBlob>

export default meta

export const FileRendererBlobExample = {
  render: () => (
    <FileRendererBlob identityUuid="0000000-0000-0000-0000-000000000000" size={5} type="svg" url="testurl" />
  ),
}
