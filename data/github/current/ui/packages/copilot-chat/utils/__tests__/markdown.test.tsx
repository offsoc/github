import {mockClientEnv} from '@github-ui/client-env/mock'
import {isFeatureEnabled} from '@github-ui/feature-flags'
import {SafeHTMLDiv} from '@github-ui/safe-html'
import {render, screen} from '@testing-library/react'

import {reactReplaceElementPrefix} from '../../components/ReactMarkdownRenderer'
import {
  transformContentToHTML,
  transformContentToHTMLWithAnnotations,
  transformContentToHTMLWithCitations,
} from '../markdown'

jest.mock('@github-ui/feature-flags')

describe('transformContentToHTML', () => {
  const tests = [
    {
      input: `<a href="javascript:alert('hello')">hello</a>`,
      output: `<p><a target="_blank" rel="noopener noreferrer">hello</a></p>\n`,
    },
    {
      input: `<a href="https://www.google.com">hello</a>`,
      output: `<p><a href="https://www.google.com" target="_blank" rel="noopener noreferrer">hello</a></p>\n`,
    },
    {
      input: `<p id="filtered" style="color: red;" data-filtered-attr="also-filtered">hello</p>`,
      output: `<p>hello</p>`,
    },
    {
      input: `<p style="color: red;">hello</p>`,
      output: `<p>hello</p>`,
    },
    {
      input: `<p data-filtered-attr="filtered">hello</p>`,
      output: `<p>hello</p>`,
    },
    {
      input: `<form><input type="text" value="hello" /><p>hello</p></form>`,
      output: `<p>hello</p>`,
    },
    {
      input: `<style>body { color: red; }</style><p>hello</p>`,
      output: `<p>hello</p>`,
    },
    {
      input: `<button onclick="alert('hello')"><span>hello</span></button>`,
      output: `<p><span>hello</span></p>\n`,
    },
    {
      input: `<pre><code class="hljs language-javascript"><span class="hljs-keyword">const</span> <span class="hljs-params">a</span> = <span class="hljs-number">1</span></code></pre>`,
      output: `<pre><code class="hljs language-javascript"><span class="hljs-keyword">const</span> <span class="hljs-params">a</span> = <span class="hljs-number">1</span></code></pre>`,
    },
    {
      input: `<pre><code class="hljs language-javascript should-be-filtered"><span class="hljs-keyword also-filtered">const</span> <span class="hljs-params">a</span> = <span class="hljs-number">1</span></code></pre>`,
      output: `<pre><code class="hljs language-javascript"><span class="hljs-keyword">const</span> <span class="hljs-params">a</span> = <span class="hljs-number">1</span></code></pre>`,
    },
    {
      input: `<pre><code class="not-hljs not-language-javascript"><span class="hljs-keyword also-filtered">const</span> <span class="hljs-params">a</span> = <span class="hljs-number">1</span></code></pre>`,
      output: `<pre><code><span class="hljs-keyword">const</span> <span class="hljs-params">a</span> = <span class="hljs-number">1</span></code></pre>`,
    },
  ]

  it.each(tests)('should sanitize and avoid dangerous attributes and tags', ({input, output}) => {
    const sanitizedInput = transformContentToHTML(input)
    expect(JSON.stringify(sanitizedInput)).toBe(JSON.stringify(output))
  })

  it('opens link in same tab when in assistive', () => {
    const input = `<a href="javascript:alert('hello')">hello</a>`
    const output = `<p><a>hello</a></p>\n`
    const sanitizedInput = transformContentToHTML(input, null, [], true)
    expect(JSON.stringify(sanitizedInput)).toBe(JSON.stringify(output))
  })

  it('makes code blocks copyable', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.crypto.randomUUID = jest.fn(() => 'e042c512-3b61-407a-8e78-532337c5e91a') as any
    const input = `\`\`\`
console.log('hello world')
\`\`\`\n`
    const html = transformContentToHTML(input)
    const expected = `<span data-snippet-clipboard-copy-content="console.log('hello world')" class="snippet-clipboard-content">`

    expect(html).toContain(expected)
  })

  it('handles language tags on code blocks', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.crypto.randomUUID = jest.fn(() => 'e042c512-3b61-407a-8e78-532337c5e91a') as any
    const input = `\`\`\`javascript
console.log('hello world')
\`\`\`\n`
    const html = transformContentToHTML(input)
    const expected = `<span data-snippet-clipboard-copy-content="console.log('hello world')" class="snippet-clipboard-content">`

    expect(html).toContain(expected)
  })

  it('adds styling to diff code blocks when copilot_format_diff flag is enabled', () => {
    ;(isFeatureEnabled as jest.Mock).mockImplementation(flag => flag === 'copilot_format_diff')

    expect(isFeatureEnabled('copilot_format_diff')).toBe(true)

    mockClientEnv({featureFlags: ['copilot_format_diff']})

    const input = `\`\`\`diff
console.log('hello world')
\`\`\`\n`
    const html = transformContentToHTML(input)
    const expected = `<copilot-inline-diff data-diff="console.log('hello world')" data-filepath=""></copilot-inline-diff>`
    expect(html).toBe(expected)
  })

  it('correctly parses the diff when styling diff code blocks when copilot_format_diff flag is enabled', () => {
    ;(isFeatureEnabled as jest.Mock).mockImplementation(flag => flag === 'copilot_format_diff')

    expect(isFeatureEnabled('copilot_format_diff')).toBe(true)

    mockClientEnv({featureFlags: ['copilot_format_diff']})

    const input = `\`\`\`diff
 [-1,1]+console.log('hello world')
\`\`\`\n`
    const html = transformContentToHTML(input)
    const expected = `<copilot-inline-diff data-diff=" [-1,1]+console.log('hello world')" data-filepath=""></copilot-inline-diff>`
    expect(html).toBe(expected)

    // Add to body in order to test the custom element
    document.body.innerHTML = html

    const expectedHtml = `<copilot-inline-diff data-diff=" [-1,1]+console.log('hello world')" data-filepath="" data-catalyst=""><table class="diff-table file"><tr><td class="blob-num blob-num-addition" data-line-number=""></td><td class="blob-num blob-num-addition" data-line-number="1"></td><td class="blob-code blob-code-addition blob-code-inner blob-code-marker hljs language-sql" data-code-marker="+">console.<span class="hljs-built_in">log</span>(<span class="hljs-string">'hello world'</span>)</td></tr></table></copilot-inline-diff>`
    expect(document.body.innerHTML).toBe(expectedHtml)
  })

  it('styles links', () => {
    const html = transformContentToHTML(
      `
here are some links:
[link a](https://bing.com)
[link b](http://localhost/primer/react/blob/main/packages/react/src/Box/Box.tsx#L17-L24)
[link c](http://localhost/primer/react/blob/main/packages/react/src/Link/Link.tsx)
[link d](http://localhost/primer/react/commit/a3355a5483e37bebe077c7aa000ae8e4ed0f77b9)
[link e](https://whatsprintis.it)
      `,
      [
        {
          type: 'web-search',
          query: 'what sprint is it?',
          status: 'success',
          results: [{title: 'What sprint is it?', excerpt: 'sprint 238 week 1', url: 'https://whatsprintis.it'}],
        },
      ],
    )
    render(<SafeHTMLDiv html={html} />)
    expect(screen.getByText('link a').classList).toHaveLength(0)
    // the smart thing to do would be to use .classList instead of .className.split(' '), but invoking .classList
    // causes a weird exception because of something in our test environment that I'm not interested in tracking down
    expect(screen.getByText('link b').className.split(' ')).toEqual(expect.arrayContaining(['icon-link', 'snippet']))
    expect(screen.getByText('link c').className.split(' ')).toEqual(expect.arrayContaining(['icon-link', 'file']))
    expect(screen.getByText('link d').className.split(' ')).toEqual(expect.arrayContaining(['icon-link', 'commit']))
    expect(screen.getByText('link e').className.split(' ')).toEqual(expect.arrayContaining(['color-icon-link', 'bing']))
  })

  it('allows ids starting with the react-replace prefix', () => {
    ;(isFeatureEnabled as jest.Mock).mockImplementation(flag => flag === 'copilot_react_markdown')
    const input = `<span id="${reactReplaceElementPrefix}-foo"></span>`
    const output = `<p><span id="${reactReplaceElementPrefix}-foo"></span></p>\n`
    const sanitizedInput = transformContentToHTML(input)
    expect(JSON.stringify(sanitizedInput)).toBe(JSON.stringify(output))
  })
})

describe('transformContentToHTMLWithCitations', () => {
  it('linkifies and renumbers citations', () => {
    const input = `foo[citationId: 2], bar[citationId: 4]`
    const references = [
      {url: 'http://bing.com'},
      {url: 'http://google.com'},
      {url: 'http://altavista.com'},
      {url: 'http://lycos.com'},
    ]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const result = transformContentToHTMLWithCitations(input, references as any)
    expect(result.html).toBe(
      `<p>foo<a href="http://google.com" target="_blank" rel="noopener noreferrer">[1]</a>, bar<a href="http://lycos.com" target="_blank" rel="noopener noreferrer">[2]</a></p>\n`,
    )
    expect(result.hasCitations).toBe(true)
    expect(result.referenceMap).toEqual(
      new Map([
        [2, 1],
        [4, 2],
      ]),
    )
  })

  it('does not renumber old-style citations', () => {
    const input = `foo[2], bar[4]`
    const references = [
      {url: 'http://bing.com'},
      {url: 'http://google.com'},
      {url: 'http://altavista.com'},
      {url: 'http://lycos.com'},
    ]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const result = transformContentToHTMLWithCitations(input, references as any)
    expect(result.html).toBe(
      `<p>foo<a href="http://google.com" target="_blank" rel="noopener noreferrer">[2]</a>, bar<a href="http://lycos.com" target="_blank" rel="noopener noreferrer">[4]</a></p>\n`,
    )
    expect(result.hasCitations).toBe(true)
    expect(result.referenceMap).toEqual(
      new Map([
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ]),
    )
  })

  it('strips ^ characters out of citations', () => {
    const input = `foo[^2^], bar[^4^]`
    const references = [
      {url: 'http://bing.com'},
      {url: 'http://google.com'},
      {url: 'http://altavista.com'},
      {url: 'http://lycos.com'},
    ]
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const result = transformContentToHTMLWithCitations(input, references as any)
    expect(result.hasCitations).toBe(true)

    expect(result.html).toBe(
      `<p>foo<a href="http://google.com" target="_blank" rel="noopener noreferrer">[2]</a>, bar<a href="http://lycos.com" target="_blank" rel="noopener noreferrer">[4]</a></p>\n`,
    )
    expect(result.referenceMap).toEqual(
      new Map([
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ]),
    )
  })
})

describe('transformContentToHTMLWithAnnotations', () => {
  it('Adds code vulnerability annotations', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.crypto.randomUUID = jest.fn(() => 'e042c512-3b61-407a-8e78-532337c5e91a') as any
    const input = `\`\`\`
    console.log('hello world')
    \`\`\`\n`
    const annotations = {
      CodeVulnerability: [
        {
          startOffset: 5,
          endOffset: 9,
          details: {
            type: 'sql-injection',
            uiType: 'SQL Injection',
            description: 'SQL injections are dangerous',
            uiDescription: 'SQL injections are dangerous',
          },
        },
      ],
    }
    const result = transformContentToHTMLWithAnnotations(input, null, annotations)
    const details =
      '<details class="snippet-vulnerabilities-details"><summary class="snippet-vulnerability-summary"><div class="snippet-vulnerability-shield-icon"></div>1 vulnerability detected<div class="snippet-vulnerability-chevron"></div></summary><div class="snippet-vulnerability-details"><p class="snippet-vulnerability-details-title">SQL Injection</p><p class="snippet-vulnerability-details-description">SQL injections are dangerous</p></div></details>'
    expect(result).toContain(details)
  })

  it('Opens links in same tab in assistive', () => {
    const input = `<a href="javascript:alert('hello')">hello</a>`
    const output = `<p><a>hello</a></p>\n`
    const sanitizedInput = transformContentToHTMLWithAnnotations(input, null, {}, true)
    expect(JSON.stringify(sanitizedInput)).toBe(JSON.stringify(output))
  })

  it("doesn't crash on invalid urls", () => {
    const input = 'Here\'s a link with a syntax error <a href="https://example.com>example</a>'
    const result = transformContentToHTML(input)
    expect(result).toBe(
      '<p>Here\'s a link with a syntax error &lt;a href="<a href="https://example.com%3Eexample" target="_blank" rel="noopener noreferrer">https://example.com&gt;example</a></p>\n',
    )
  })
})
