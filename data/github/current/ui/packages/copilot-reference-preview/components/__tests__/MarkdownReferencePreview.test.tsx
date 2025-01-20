import {transformContentToHTML} from '@github-ui/copilot-chat/utils/markdown'

describe('markdown highlighting', () => {
  test('simple case', () => {
    const markdown = 'a\nb\nc'
    const html = transformContentToHTML(markdown, null, [], false, undefined, undefined, 2, 2)
    expect(html).toBe('<p>b</p>\n')
  })
})

describe('markdown reference code is copyable', () => {
  test('renders with correct data attrs and class', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.crypto.randomUUID = jest.fn(() => 'e042c512-3b61-407a-8e78-532337c5e91a') as any
    const markdown = `\`\`\`ruby\ndef func\`\`\`\nim not code\n\`\`\`ruby\nend\`\`\``
    const html = transformContentToHTML(markdown, null, [], false, undefined, undefined, 1, 2)
    const expected = `<span data-snippet-clipboard-copy-content="def func\`\`\`" class="snippet-clipboard-content"><pre><code class="hljs language-ruby">def <span class="hljs-function"><span class="hljs-keyword">func</span></span>\`\`\`\n</code></pre></span>`

    expect(html).toContain(expected)
  })
})
