import type {Meta} from '@storybook/react'
import {ReposSelector, simpleRepoLoader, type SingleSelectProps, type MultiSelectProps} from './ReposSelector'

type NamedRepo = {name: string}

const repos: NamedRepo[] = [
  {
    name: 'github/github',
  },
  {
    name: 'monalisa/smile',
  },
  {
    name: 'github/public-server',
  },
]

const meta = {
  title: 'ReposComponents/ReposSelector',
  component: ReposSelector,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
} satisfies Meta<typeof ReposSelector>

export default meta

const defaultArgs: Partial<SingleSelectProps<NamedRepo> | MultiSelectProps<NamedRepo>> = {
  currentSelection: undefined,
  selectAllOption: true,
  selectionVariant: 'single',
  repositoryLoader: simpleRepoLoader(repos),
  onSelect: () => null,
}

export const ReposSelectorExample = {
  args: {
    ...defaultArgs,
  },
  render: (args: SingleSelectProps<NamedRepo> | MultiSelectProps<NamedRepo>) => <ReposSelector {...args} />,
}
