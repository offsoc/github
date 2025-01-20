import type {SafeHTMLString} from '@github-ui/safe-html'
import type {Meta} from '@storybook/react'
import type {ComponentProps} from 'react'

import {getRepositoriesRoutePayload} from '../test-utils/mock-data'
import {ReposList} from './ReposList'

const meta: Meta<typeof ReposList> = {
  title: 'Apps/Repos List/Components/ReposList',
  component: ReposList,
}

export default meta

const sampleProps: ComponentProps<typeof ReposList> = {
  compactMode: false,
  showSpinner: false,
  repositoryCount: 4,
  repos: [
    ...getRepositoriesRoutePayload().repositories,
    {
      name: 'github',
      type: 'Private',
      owner: 'monalisa',
      isFork: false,
      description:
        'Sit on human have secret plans and swat turds around the house. <a href="https://github.com">https://github.com</a>. More napping, more napping all the napping is exhausting leave fur on owners clothes, naughty running cat. ' as SafeHTMLString,
      allTopics: ['planes', 'trains', 'automobiles', 'a-long-topic-name-haha'],
      primaryLanguage: {name: 'Jupiter Notebook', color: '#701416'},
      pullRequestCount: 999,
      issueCount: 20,
      forksCount: 7,
      starsCount: 40,
      license: 'MIT License',
      lastUpdated: {hasBeenPushedTo: true, timestamp: '2020-01-01T00:00:00.000Z'},
      participation: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    {
      name: 'maximum',
      type: 'Public mirror',
      owner: 'monalisa',
      isFork: true,
      description:
        'Sit on human have secret plans and swat turds around the house. More napping, more napping all the napping is exhausting leave fur on owners clothes, naughty running cat.' as SafeHTMLString,
      allTopics: ['planes', 'trains', 'automobiles', 'a-long-topic-name-haha'],
      primaryLanguage: null,
      pullRequestCount: 0,
      issueCount: 0,
      forksCount: 254_700,
      starsCount: 341_819,
      license: 'MIT License',
      lastUpdated: {hasBeenPushedTo: true, timestamp: new Date().toISOString()},
      participation: [1, 213, 33, 1213, 3, 1],
    },
    {
      name: 'longnamelongnamelongnamelongnamelongnamelongnamelongnamelongnamelongnamelongnamelongnamelongnamelongnamelongnamelongname',
      type: 'Public mirror',
      owner: 'monalisa',
      isFork: true,
      description:
        'Sit on human have secret plans and swat turds around the house. More napping, more napping all the napping is exhausting leave fur on owners clothes, naughty running cat.' as SafeHTMLString,
      allTopics: ['planes', 'trains', 'automobiles', 'a-long-topic-name-haha'],
      primaryLanguage: null,
      pullRequestCount: 0,
      issueCount: 0,
      forksCount: 254_700,
      starsCount: 341_819,
      license: 'MIT License',
      lastUpdated: {hasBeenPushedTo: true, timestamp: new Date().toISOString()},
      participation: [1, 213, 33, 1213, 3, 1],
    },
  ],
  onSortingItemSelect: () => undefined,
}

export const DefaultList = () => {
  return (
    // data-a11y-link-underlines simulates `Link underlines` user setting.
    <div data-a11y-link-underlines="true">
      <ReposList {...sampleProps} />
    </div>
  )
}
