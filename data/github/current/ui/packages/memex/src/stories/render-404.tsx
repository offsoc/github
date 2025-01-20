import {testIdProps} from '@github-ui/test-id-props'
import {StrictMode} from 'react'
import type {Root} from 'react-dom/client'

export function render404(root: Root) {
  root.render(
    <StrictMode>
      <p {...testIdProps('404-page')}>404 invalid url - in production, the gh 404 would show here</p>
    </StrictMode>,
  )
}
