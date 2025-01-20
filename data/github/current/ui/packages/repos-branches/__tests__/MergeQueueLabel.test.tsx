import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import MergeQueueLabel from '../components/MergeQueueLabel'

const mergeQueueUrl = 'http://github.localhost.com/monalisa/smile/queue'

test('renders the MergeQueueLabel component', () => {
  const queueCount = 10
  render(<MergeQueueLabel mergeQueueUrl={mergeQueueUrl} queueCount={queueCount} />)

  expect(screen.getByRole('link', {name: `There are ${queueCount} pull requests in the merge queue`})).toBeVisible()
  expect(screen.getByRole('tooltip', {name: 'View the merge queue'})).toBeVisible()
})

test('renders the MergeQueueLabel component when there is 1 pull request', () => {
  const queueCount = 1
  render(<MergeQueueLabel mergeQueueUrl={mergeQueueUrl} queueCount={queueCount} />)

  expect(screen.getByRole('link', {name: `There is ${queueCount} pull request in the merge queue`})).toBeVisible()
  expect(screen.getByRole('tooltip', {name: 'View the merge queue'})).toBeVisible()
})
