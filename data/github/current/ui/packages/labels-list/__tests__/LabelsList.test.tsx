import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {LabelsList} from '../LabelsList'
import {buildLabel} from '../build-label'

test('Renders the LabelsList', async () => {
  const labels = [
    buildLabel({
      name: 'good for new contributors',
    }),
    buildLabel({
      name: 'here there be dragons',
    }),
  ]

  render(<LabelsList labels={labels} />)
  expect(screen.getByText('good for new contributors')).toBeInTheDocument()
  expect(screen.getByText('here there be dragons')).toBeInTheDocument()
})

test('Renders default empty text when labels is an empty array', async () => {
  render(<LabelsList labels={[]} />)
  expect(screen.getByText('No labels')).toBeInTheDocument()
})

test('Renders the emptyText prop when labels is an empty array', async () => {
  render(<LabelsList labels={[]} emptyText="Nope" />)
  expect(screen.getByText('Nope')).toBeInTheDocument()
})

test('Renders the Label tooltip', async () => {
  const labels = [
    buildLabel({
      name: 'contributors',
      description: 'good for new contributors',
    }),
  ]

  render(<LabelsList labels={labels} />)
  expect(screen.getByLabelText('good for new contributors')).toBeInTheDocument()
})
