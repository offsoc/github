import type {Meta} from '@storybook/react'

import {getRepositoryReferenceMock, getSnippetReferenceMock, getSymbolReferenceMock} from '../test-utils/mock-data'
import type {ChatReferencesProps} from './ChatReferences'
import {ChatReferences} from './ChatReferences'

const meta = {
  title: 'Apps/Copilot/ChatReferences',
  component: ChatReferences,
  parameters: {},
  argTypes: {},
} satisfies Meta<typeof ChatReferences>

export default meta

const defaultArgs: ChatReferencesProps = {
  references: [getRepositoryReferenceMock(), getSnippetReferenceMock(), getSymbolReferenceMock()],
  referenceMap: null,
  showReferenceNumbers: false,
}

export const Example = {
  args: {
    ...defaultArgs,
  },
  render: (args: ChatReferencesProps) => {
    return (
      <div>
        <ChatReferences {...args} />
      </div>
    )
  },
}
