import {testIdProps} from '@github-ui/test-id-props'
import {render, screen} from '@testing-library/react'

import {SanitizedHtml} from '../../client/components/dom/sanitized-html'

test('renders a span by default', () => {
  render(<SanitizedHtml {...testIdProps('element')}>{`<div>Hello world</div>`}</SanitizedHtml>)
  expect(screen.getByTestId('element').tagName).toEqual('SPAN')
  expect(screen.getByTestId('element')).not.toHaveTextContent('div')
  expect(screen.getByTestId('element')).toHaveTextContent('Hello world')
})

test('renders the as prop when given by default', () => {
  render(
    <SanitizedHtml as="bdi" {...testIdProps('element')}>
      {`<div>Hello world</div>`}
    </SanitizedHtml>,
  )
  expect(screen.getByTestId('element').tagName).toEqual('BDI')
  expect(screen.getByTestId('element')).not.toHaveTextContent('div')
  expect(screen.getByTestId('element')).toHaveTextContent('Hello world')
})
