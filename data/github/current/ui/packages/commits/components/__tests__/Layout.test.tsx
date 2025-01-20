import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import Layout from '../Layout'

test('Page layout can render an h1 and child content', async () => {
  render(
    <Layout title="Commits">
      <div>Child Content</div>
    </Layout>,
  )

  const heading = screen.getByRole('heading', {name: 'Commits'})
  expect(heading).toBeInTheDocument()
  expect(heading.tagName).toBe('H1')
  expect(heading).toHaveAttribute('id', 'commits-pagehead')
  expect(screen.getByText('Child Content')).toBeInTheDocument()
})
