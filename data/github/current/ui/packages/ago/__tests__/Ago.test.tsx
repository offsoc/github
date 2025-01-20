import {render} from '@testing-library/react'

import {Ago} from '../Ago'

const ago = [
  {description: '5 seconds ago', diff: 5, expected: '5 seconds ago'},
  {description: '5 minutes ago', diff: 5 * 60, expected: '5 minutes ago'},
  {description: '59 minutes ago', diff: 59 * 60, expected: '59 minutes ago'},
  {description: '60 minutes ago', diff: 60 * 60, expected: '60 minutes ago'},
  {description: 'A bit more than 60 minutes ago', diff: 60 * 60 + 1, expected: '1 hour ago'},
  {description: '1.5 hours ago', diff: 1.5 * 60 * 60, expected: '1 hour ago'},
  {description: '2.5 hours ago', diff: 2.5 * 60 * 60, expected: '2 hours ago'},
  {description: 'Almost 24 hours ago', diff: 24 * 60 * 60 - 5, expected: '23 hours ago'},
  {description: 'A bit more than 24 hours ago', diff: 24 * 60 * 60 + 5, expected: 'yesterday'},
  {description: '13 days ago', diff: 13 * 24 * 60 * 60, expected: '13 days ago'},
  {description: '14 days ago', diff: 14 * 24 * 60 * 60, expected: '14 days ago'},
  {description: '30 days ago', diff: 30 * 24 * 60 * 60, expected: '30 days ago'},
  {description: '31 days ago', diff: 31 * 24 * 60 * 60, expected: 'on Nov 30'},
  {description: '300 days ago', diff: 300 * 24 * 60 * 60, expected: 'on Mar 6'},
  {description: '360 days ago', diff: 360 * 24 * 60 * 60, expected: 'on Jan 6'},
  {description: '365 days ago', diff: 365 * 24 * 60 * 60, expected: 'on Jan 1'},
  {description: '367 days ago', diff: 367 * 24 * 60 * 60, expected: 'on Dec 30, 2019'},
  {description: '10 years ago', diff: 10 * 365 * 24 * 60 * 60, expected: 'on Jan 3, 2011'},
]

const agoWithoutPreposition = [
  {description: '5 seconds ago', diff: 5, expected: '5 seconds ago'},
  {description: '5 minutes ago', diff: 5 * 60, expected: '5 minutes ago'},
  {description: '59 minutes ago', diff: 59 * 60, expected: '59 minutes ago'},
  {description: '60 minutes ago', diff: 60 * 60, expected: '60 minutes ago'},
  {description: 'A bit more than 60 minutes ago', diff: 60 * 60 + 1, expected: '1 hour ago'},
  {description: '1.5 hours ago', diff: 1.5 * 60 * 60, expected: '1 hour ago'},
  {description: '2.5 hours ago', diff: 2.5 * 60 * 60, expected: '2 hours ago'},
  {description: 'Almost 24 hours ago', diff: 24 * 60 * 60 - 5, expected: '23 hours ago'},
  {description: 'A bit more than 24 hours ago', diff: 24 * 60 * 60 + 5, expected: 'yesterday'},
  {description: '13 days ago', diff: 13 * 24 * 60 * 60, expected: '13 days ago'},
  {description: '14 days ago', diff: 14 * 24 * 60 * 60, expected: '14 days ago'},
  {description: '30 days ago', diff: 30 * 24 * 60 * 60, expected: '30 days ago'},
  {description: '31 days ago', diff: 31 * 24 * 60 * 60, expected: 'Nov 30'},
  {description: '300 days ago', diff: 300 * 24 * 60 * 60, expected: 'Mar 6'},
  {description: '360 days ago', diff: 360 * 24 * 60 * 60, expected: 'Jan 6'},
  {description: '365 days ago', diff: 365 * 24 * 60 * 60, expected: 'Jan 1'},
  {description: '367 days ago', diff: 367 * 24 * 60 * 60, expected: 'Dec 30, 2019'},
  {description: '10 years ago', diff: 10 * 365 * 24 * 60 * 60, expected: 'Jan 3, 2011'},
]

const current = new Date('2020-12-31T00:00:00.000')
jest.useFakeTimers().setSystemTime(current)
test.each(ago)('displays correct ago representation: $description', ({diff, expected}) => {
  const date = new Date(current.getTime() - diff * 1000)
  const {container} = render(<Ago timestamp={date} />)
  expect(container.textContent).toBe(expected)
})

test.each(agoWithoutPreposition)('hides preposition: $description', ({diff, expected}) => {
  const date = new Date(current.getTime() - diff * 1000)
  const {container} = render(<Ago timestamp={date} usePreposition={false} />)
  expect(container.textContent).toBe(expected)
})

test('renders link parameter correctly', () => {
  const date = new Date(current.getTime())
  const githubUrl = 'https://github.com'
  const {container} = render(<Ago timestamp={date} linkUrl={githubUrl} />)

  // We want to ensure we have the correct href for the container
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(container.querySelector('a')?.getAttribute('href')).toBe(githubUrl)

  const {container: containerWithoutValidLink} = render(<Ago timestamp={date} linkUrl={undefined} />)
  // We want to ensure we don't have an href for the container
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  expect(containerWithoutValidLink.querySelector('a')?.getAttribute('href')).toBeUndefined()

  const {container: containerWithoutAnyLink} = render(<Ago timestamp={date} />)
  // We want to ensure we don't have an href for the container
  // eslint-disable-next-line testing-library/no-node-access, testing-library/no-container
  expect(containerWithoutAnyLink.querySelector('a')?.getAttribute('href')).toBeUndefined()
})
