import {sanitizeRenderedMarkdown, sanitizeTextInputHtmlString} from '../../client/helpers/sanitize'

type TestCase = {
  raw: string
  expectedTextInput: string
  expectedRenderedMarkdown: string
  githubUrl?: string
  skipImageSanitization?: boolean
}

describe('sanitize', () => {
  const sanitizationTestCases = [
    // inline tags and anchor tag
    {
      raw: `<p>a paragraph</p> <spa>and</span> <a href="https://github/com">a link</a>`,
      expectedTextInput: `a paragraph and <a href="https://github/com" target="_blank" rel="noopener noreferrer">a link</a>`,
      expectedRenderedMarkdown: `<p>a paragraph</p> and <a href="https://github/com" target="_blank" rel="noopener noreferrer">a link</a>`,
    },
    // script tag and event handler attributes
    {
      raw: `<pre>code block</pre>, <code>variable</code> <script type="text/javascript">alert('hi');</script> <a onclick="alert('hi')">link</a>`,
      expectedTextInput: `code block, <code>variable</code>  <a target="_blank" rel="noopener noreferrer">link</a>`,
      expectedRenderedMarkdown: `<pre>code block</pre>, <code>variable</code>  <a target="_blank" rel="noopener noreferrer">link</a>`,
    },
    // style tag and attrs
    {
      raw: `<span style="color: red">red</span> text.<style> * { background: red !important } </style>`,
      expectedTextInput: `red text.`,
      expectedRenderedMarkdown: `<span style="color: red">red</span> text.`,
    },
    // GFM common tags
    {
      raw:
        `<h3>Header</h3>` +
        `<hr />` +
        `<ul><li>item 1</li> <li>item 2</li></ul>` +
        `<ol><li><input type="checkbox"> task list item</li></ol>` +
        `<p><strong>Bold</strong> and <em>emphasys</em> text <br><code>shortcuts</code></p>` +
        `<div class="code-class"><pre><code data-custom="test">code block</code></pre></div>` +
        `<blockquote>blockquote</blockquote>&lt;visible-tag /&gt; <del>something removed</del>` +
        `<table><thead><tr><th>table header</th></tr></thead><tbody><tr><td>cell content</td></tr></tbody></table>` +
        `<img style="max-width: 100%" src="https://github.com/logo.png" />`,
      expectedTextInput:
        `Header` +
        `item 1 item 2` +
        ` task list item` +
        `Bold and emphasys text <code>shortcuts</code>` +
        `<code>code block</code>` +
        `blockquote&lt;visible-tag /&gt; something removed` +
        `cell content<img src="https://github.com/logo.png">`,
      expectedRenderedMarkdown:
        `<h3>Header</h3>` +
        `<hr>` +
        `<ul><li>item 1</li> <li>item 2</li></ul>` +
        `<ol><li><input type="checkbox"> task list item</li></ol>` +
        `<p><strong>Bold</strong> and <em>emphasys</em> text <br><code>shortcuts</code></p>` +
        `<div class="code-class"><pre><code>code block</code></pre></div>` +
        `<blockquote>blockquote</blockquote>&lt;visible-tag /&gt; <del>something removed</del>` +
        `<table><thead><tr><th>table header</th></tr></thead><tbody><tr><td>cell content</td></tr></tbody></table>` +
        //Note: order of attributes is dependent on the input order due to how dompurify is implemented.
        //      if this test is failing due to img attributes order, remove the style attribute
        `<img src="https://github.com/logo.png" style="max-width: 100%">`,
    },
    {
      // ensure data-plain is not sanitized away from rendered
      raw: `<div data-plain='
gitGraph
  commit id:"M1"
  checkout main
  commit id:"M2"
  branch release order:3
  checkout release
  commit id:"R1"
  checkout main
  commit id:"M3"
  branch integration order:1
  checkout integration
  commit id:"T1"
  commit id:"T2"
  checkout main
  commit id:"M4"
  branch feature order:2
  checkout feature
  commit id:"F1"
  commit id:"F2" type:HIGHLIGHT
  checkout integration
  commit id:"T3"
  commit id:"T4"
  checkout main
  commit id:"M5"
  checkout integration
  merge feature id:"PR-T5"
  checkout release
  merge feature id:"PR-R2"
  commit id:"R3"
'></div>`,
      expectedTextInput: '',
      expectedRenderedMarkdown: `<div data-plain="gitGraph
  commit id:&quot;M1&quot;
  checkout main
  commit id:&quot;M2&quot;
  branch release order:3
  checkout release
  commit id:&quot;R1&quot;
  checkout main
  commit id:&quot;M3&quot;
  branch integration order:1
  checkout integration
  commit id:&quot;T1&quot;
  commit id:&quot;T2&quot;
  checkout main
  commit id:&quot;M4&quot;
  branch feature order:2
  checkout feature
  commit id:&quot;F1&quot;
  commit id:&quot;F2&quot; type:HIGHLIGHT
  checkout integration
  commit id:&quot;T3&quot;
  commit id:&quot;T4&quot;
  checkout main
  commit id:&quot;M5&quot;
  checkout integration
  merge feature id:&quot;PR-T5&quot;
  checkout release
  merge feature id:&quot;PR-R2&quot;
  commit id:&quot;R3&quot;"></div>`,
    },
    // Images sources should only be allowed from:
    // - `github.com`
    // - `githubassets.com`
    // - `githubusercontent.com`
    {
      raw: `<div class="Overlay--hidden"><img src=//example.com></div>Test`,
      expectedTextInput: 'Test',
      expectedRenderedMarkdown: '<div class="Overlay--hidden"></div>Test',
    },
    {
      githubUrl: 'https://github.com',
      raw: `"><img src=x onerror=prompt(document.domain)>`,
      // this might look weird, but it's allowed because it's actually accessed like `github.com/x` in the browser,
      // so it's a relative path to an image which should be fine
      expectedTextInput: '"&gt;<img src="x">',
      expectedRenderedMarkdown: '"&gt;<img src="x">',
    },
    {
      raw: `<img src=https://github.githubassets.com/images/icons/emoji/octocat.png>`,
      expectedTextInput: '<img src="https://github.githubassets.com/images/icons/emoji/octocat.png">',
      expectedRenderedMarkdown: '<img src="https://github.githubassets.com/images/icons/emoji/octocat.png">',
    },
    {
      raw: `<img src="https://github.com/github.png">`,
      expectedTextInput: '<img src="https://github.com/github.png">',
      expectedRenderedMarkdown: '<img src="https://github.com/github.png">',
    },
    {
      raw: `<img src="https://camo.githubusercontent.com/example.png">`,
      expectedTextInput: '<img src="https://camo.githubusercontent.com/example.png">',
      expectedRenderedMarkdown: '<img src="https://camo.githubusercontent.com/example.png">',
    },
    {
      githubUrl: 'https://github.com',
      raw: `<img src="/images/something.png">`,
      expectedTextInput: '<img src="/images/something.png">',
      expectedRenderedMarkdown: '<img src="/images/something.png">',
    },
    {
      githubUrl: 'https://staffship-01.ghe.com',
      raw: `<img src="https://staffship-01.ghe.com/github.png">`,
      expectedTextInput: '<img src="https://staffship-01.ghe.com/github.png">',
      expectedRenderedMarkdown: '<img src="https://staffship-01.ghe.com/github.png">',
    },
    {
      githubUrl: 'https://avocado-gmbh.ghe.localhost',
      raw: `<img src="https://avocado-gmbh.ghe.localhost/github.png">`,
      expectedTextInput: '<img src="https://avocado-gmbh.ghe.localhost/github.png">',
      expectedRenderedMarkdown: '<img src="https://avocado-gmbh.ghe.localhost/github.png">',
    },
    {
      githubUrl: 'https://github.localhost',
      raw: `<img src="https://github.localhost/github.png">`,
      expectedTextInput: '<img src="https://github.localhost/github.png">',
      expectedRenderedMarkdown: '<img src="https://github.localhost/github.png">',
    },
    // test that `media.GHES_HOSTNAME` and other subdomains are allowed when image sanitization is enabled
    {
      githubUrl: 'https://test.ghes.net',
      raw: `<img src="https://media.test.ghes.net/user/6/files/abc123">`,
      expectedTextInput: `<img src="https://media.test.ghes.net/user/6/files/abc123">`,
      expectedRenderedMarkdown: `<img src="https://media.test.ghes.net/user/6/files/abc123">`,
    },
    {
      githubUrl: 'https://test.ghes.net',
      raw: `<img src="https://assets.test.ghes.net/user/6/files/abc123">`,
      expectedTextInput: `<img src="https://assets.test.ghes.net/user/6/files/abc123">`,
      expectedRenderedMarkdown: `<img src="https://assets.test.ghes.net/user/6/files/abc123">`,
    },
    {
      githubUrl: 'https://test.ghes.net',
      raw: `<img src="https://test.ghes.net/testcorp/memex/assets/6/abc123">`,
      expectedTextInput: `<img src="https://test.ghes.net/testcorp/memex/assets/6/abc123">`,
      expectedRenderedMarkdown: `<img src="https://test.ghes.net/testcorp/memex/assets/6/abc123">`,
    },
    {
      githubUrl: 'https://test.ghes.net',
      raw: `<img src="https://malicious.com/url#https://media.test.ghes.net/user/6/files/abc123">`,
      expectedTextInput: ``,
      expectedRenderedMarkdown: ``,
    },
    {
      githubUrl: 'https://test.ghes.net',
      raw: `<img src="https://malicious.com/url#test.ghes.net/testcorp/memex/assets/6/abc123">`,
      expectedTextInput: ``,
      expectedRenderedMarkdown: ``,
    },
    // Test that when image sanitization is off, external image links are allowed
    {
      raw: `<img src="https://external-website.com/image.png">`,
      expectedTextInput: ``,
      expectedRenderedMarkdown: `<img src="https://external-website.com/image.png">`,
      skipImageSanitization: true,
    },
  ] satisfies Array<TestCase>

  it.each(sanitizationTestCases)(
    'should strips html tags except if explicitly allowed when using the text input sanitization',
    ({raw, expectedTextInput, githubUrl = 'https://github.com'}: TestCase) => {
      mockBaseURI(githubUrl)
      mockGitHubURL(githubUrl)

      const sanitizedResult = sanitizeTextInputHtmlString(raw)

      expect(sanitizedResult).toBe(expectedTextInput)
    },
  )

  it.each(sanitizationTestCases)(
    'should allow tags used in markdown, while still avoid dangerous tags when using sanitization for markdown',
    ({raw, expectedRenderedMarkdown, githubUrl = 'https://github.com', skipImageSanitization}: TestCase) => {
      mockBaseURI(githubUrl)
      mockGitHubURL(githubUrl)

      // NOTE: adding this lint-ignore bellow because if the method has "render" as part of its name,
      //       it tries to enforce a specific variable name (view, utils), which doesn't apply here
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const sanitizedResult = sanitizeRenderedMarkdown(raw, {skipImageSanitization})

      expect(sanitizedResult).toBe(expectedRenderedMarkdown)
    },
  )
})

const mockGitHubURL = (url: string) => {
  Object.defineProperty(document, 'getElementById', {
    value: (id: string) => {
      if (id === 'github-url') {
        return {
          textContent: url,
        }
      }
    },
    writable: true,
  })
}

const mockBaseURI = (url: string) => {
  Object.defineProperty(document, 'baseURI', {
    value: url,
    writable: true,
  })
}
