import {ListView} from '@github-ui/list-view'
import type {RepositoryItem} from '@github-ui/repos-list-shared'
import type {SafeHTMLString} from '@github-ui/safe-html'
import type {Meta} from '@storybook/react'

import {ReposListItem} from './ReposListItem'

const meta = {
  title: 'Apps/Repos List/Components/ReposListItem',
  component: ReposListItem,
} satisfies Meta<typeof ReposListItem>

export default meta

const repo: RepositoryItem = {
  name: 'github',
  type: 'Private',
  owner: 'monalisa',
  isFork: false,
  description:
    'Sit on human have secret plans and swat turds around the house. More napping, more napping all the napping is exhausting leave fur on owners clothes, naughty running cat.' as SafeHTMLString,
  allTopics: ['planes', 'trains', 'automobiles', 'a-long-topic-name-haha'],
  primaryLanguage: {name: 'Jupiter Notebook', color: '#701416'},
  pullRequestCount: 999,
  issueCount: 20,
  forksCount: 100,
  starsCount: 2,
  license: 'MIT License',
  lastUpdated: {hasBeenPushedTo: true, timestamp: '2020-01-01T00:00:00.000Z'},
  participation: [1, 2, 3, 4, 5, 6, 7, 8],
}

export const Default = () => {
  return (
    <ListView title="ReposListItem story list" variant="default">
      <ReposListItem repo={repo} />
    </ListView>
  )
}

export const Compact = () => {
  return (
    <ListView title="Sample repositories list" variant="compact">
      <ReposListItem repo={repo} />
    </ListView>
  )
}
