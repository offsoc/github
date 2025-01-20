import {screen, waitFor} from '@testing-library/react'

import {renderCodeMirror} from '../test-helpers'

// Flakey test! See https://github.com/github/web-systems/issues/2277 for more information
// https://github.com/github/github/actions/runs/10139831949/job/28033892185
test.skip('can detect language and load syntax highlighting', async () => {
  await renderCodeMirror({
    value: 'const foo = "bar"',
    fileName: 'test.js',
  })

  await waitFor(() =>
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId('codemirror-editor').querySelector('[data-language="javascript"]')).toBeInTheDocument(),
  )

  hasSyntaxHighlighting(['const', 'foo', '"bar"'])
})

test('can load additional syntax highlighting per language', async () => {
  await renderCodeMirror({
    value: 'map_to_service :blob', // map_to_service doesnt highlight without additional configuration loaded
    fileName: 'test.rb',
  })

  await waitFor(() =>
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId('codemirror-editor').querySelector('[data-language="ruby"]')).toBeInTheDocument(),
  )

  hasSyntaxHighlighting(['map_to_service', ':blob'])
})

test('can load gfm syntax highlighting', async () => {
  // task lists are gfm-specific
  // other tokens like ### for headings are generic markdown highlighting
  await renderCodeMirror({
    value: `
## Tasklist
* [ ] to do
* [x] done`,
    fileName: 'test.md',
  })

  await waitFor(() =>
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByTestId('codemirror-editor').querySelector('[data-language="markdown"]')).toBeInTheDocument(),
  )

  hasSyntaxHighlighting(['[x]', '[ ]', '##'])
})

function hasSyntaxHighlighting(tokens: string[]) {
  // check that tokens have syntax highlighting and not falling back to raw text within the line
  for (const token of tokens) {
    const tokenElement = screen.getByText(token)
    expect(tokenElement).not.toHaveClass('cm-line')

    // codemirror generates its own class names for syntax highlighting, always starting with ͼ
    expect(/^ͼ/.test(tokenElement.className)).toBe(true)
  }
}
