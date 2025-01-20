import type {Meta} from '@storybook/react'

import {GitIgnoreDropdown} from './GitIgnoreDropdown'

const meta = {
  title: 'ReposComponents/GitignoreDropdown',
  component: GitIgnoreDropdown,
  parameters: {},
} satisfies Meta<typeof GitIgnoreDropdown>

export default meta

global.fetch = async info => {
  if (info.toString().includes('/site/gitignore/templates')) {
    return new Response(JSON.stringify(Array.from({length: 100}, (_, i) => i).map(i => `gitignore ${i + 1}`)))
  }

  return new Response()
}

const sampleProps: React.ComponentProps<typeof GitIgnoreDropdown> = {
  onSelect: () => undefined,
}

export const Default = () => {
  return <GitIgnoreDropdown {...sampleProps} />
}

export const WithInitialSelection = () => {
  return <GitIgnoreDropdown {...sampleProps} selectedTemplate="gitignore 3" />
}
