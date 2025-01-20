import type {Label} from '../../client/api/common-contracts'

export const mockLabels = new Array<Label>(
  {
    color: 'a2eeef',
    id: 22,
    name: 'enhancement ✨',
    nameHtml:
      'enhancement <g-emoji class="g-emoji" alias="sparkles" fallback-src="http://assets.github.com/images/icons/emoji/unicode/2728.png">✨</g-emoji>',
    url: 'http://github.localhost/github/another/labels/enhancement',
  },
  {
    color: 'fedcba',
    id: 23,
    name: 'tech debt',
    nameHtml: 'tech debt',
    url: 'http://github.localhost/github/another/labels/tech%20debt',
  },
  {
    color: 'ff0000',
    id: 24,
    name: 'blocker',
    nameHtml: 'blocker',
    url: 'http://github.localhost/github/another/labels/blocker',
  },
  {
    color: 'd73a4a',
    id: 25,
    name: 'bug',
    nameHtml: 'bug',
    url: 'http://github.localhost/github/another/labels/bug',
  },
  {
    color: '3370C4',
    id: 26,
    name: '🏓 Table',
    nameHtml: '🏓 Table',
    url: 'http://github.localhost/github/memex/labels/🏓%20Table',
  },
  {
    color: '0cf478',
    id: 27,
    name: 'tech debt',
    nameHtml: 'tech debt',
    url: 'http://github.localhost/github/memex/labels/tech%20debt',
  },
  {
    color: 'DD1FAE',
    id: 28,
    name: 'infrastructure',
    nameHtml: 'infrastructure',
    url: 'http://github.localhost/github/memex/labels/infrastructure',
  },
  {
    color: 'ffd78e',
    id: 29,
    name: 'performance :dash:',
    nameHtml: 'performance :dash:',
    url: 'https://github.localhost/github/memex/labels/performance%20%3Adash%3A',
  },
  {
    color: 'FEDBF0',
    id: 30,
    name: 'design',
    nameHtml: 'design',
    url: 'https://github.localhost/github/memex/labels/design',
  },
  {
    color: 'a4f287',
    id: 31,
    name: 'backend',
    nameHtml: 'backend',
    url: 'https://github.localhost/github/memex/labels/backend',
  },
  {
    color: '8dc6fc',
    id: 32,
    name: 'frontend',
    nameHtml: 'frontend',
    url: 'https://github.localhost/github/memex/labels/frontend',
  },
  {
    color: 'c96206',
    id: 33,
    name: 'changelog:dependencies',
    nameHtml: 'changelog:dependencies',
    url: 'https://github.localhost/github/memex/labels/changelog:dependencies',
  },
)

export const getLabel = (id: number) => {
  const label = mockLabels.find(l => l.id === id)
  if (!label) {
    throw Error(`Unable to find label with id ${id} - please check the mock data`)
  }

  return label
}

export const DefaultSuggestedLabels = mockLabels

export const mockSuggestedLabels = mockLabels.map(label => ({...label, selected: false}))

export const getSuggestedLabelsWithSelection = (selectedIndices: Array<number>) => {
  return mockSuggestedLabels.map((label, index) => {
    if (selectedIndices.includes(index)) return {...label, selected: true}
    else return label
  })
}
