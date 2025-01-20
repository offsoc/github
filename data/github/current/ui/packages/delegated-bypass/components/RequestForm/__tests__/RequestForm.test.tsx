import {fireEvent, screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {RequestForm} from '../index'

const instructions = {
  title: 'test title',
  Content: () => <>test content</>,
  ApproversFooter: () => <>test approvers</>,
}

test('renders RequestForm', () => {
  render(<RequestForm instructions={instructions} />)

  const commentTextarea = screen.getByRole('textbox')
  expect(commentTextarea).toBeVisible()

  const submitButton = screen.getByRole('button')
  fireEvent.click(submitButton)
  const commentIsRequired = screen.getByText('A comment is required')
  expect(commentIsRequired).toBeVisible()

  fireEvent.change(commentTextarea, {target: {value: 'Please allow me to bypass'}})
  fireEvent.click(submitButton)
  expect(commentIsRequired).not.toBeVisible()
})
