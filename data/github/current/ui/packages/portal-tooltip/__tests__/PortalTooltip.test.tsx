import {testIdProps} from '@github-ui/test-id-props'
import {screen, waitFor} from '@testing-library/react'
import {useRef} from 'react'
import {render} from '@github-ui/react-core/test-utils'

import {usePortalTooltip} from '../hooks/UsePortalTooltip'

const TestComponent = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [contentProps, tooltip] = usePortalTooltip({
    contentRef: ref,
    'aria-label': 'An accessible description',
  })

  return (
    <div {...contentProps} {...testIdProps('test-component')}>
      Hello
      {tooltip}
    </div>
  )
}

test('renders a portal tooltip', async () => {
  const {user} = render(<TestComponent />)

  const content = screen.getByTestId('test-component')
  expect(content).toBeInTheDocument()
  expect(content).toHaveAttribute('aria-describedby')
  const describedBy = content.getAttribute('aria-describedby')
  const tooltip = screen.getByRole('tooltip')
  expect(tooltip).toBeInTheDocument()
  expect(tooltip).toHaveAttribute('id', describedBy)
  expect(tooltip).toHaveAccessibleName('An accessible description')
  expect(tooltip).not.toHaveClass('tooltipped-open')

  await user.hover(content)

  await waitFor(() => expect(tooltip).toHaveClass('tooltipped-open'))
  expect(content).not.toContain(tooltip)
  await user.unhover(content)

  await waitFor(() => expect(tooltip).not.toHaveClass('tooltipped-open'))
})
