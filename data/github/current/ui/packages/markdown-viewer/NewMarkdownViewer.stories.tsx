import type {SafeHTMLString} from '@github-ui/safe-html'
import {NewMarkdownViewer} from './NewMarkdownViewer'
import type {Meta} from '@storybook/react'
import {useCallback, useMemo, useState} from 'react'
import debounce from 'lodash-es/debounce'
import {useSafeAsyncCallback} from '@github-ui/use-safe-async-callback'

type ArgProps = {
  loading: boolean
}

const meta: Meta = {
  title: 'Recipes/CommentBox/NewMarkdownViewer',
  parameters: {
    controls: {
      include: ['Loading', 'Open Links In New Tab'],
    },
  },
  component: NewMarkdownViewer,
  args: {
    loading: false,
    linksInNewTab: false,
  },
  argTypes: {
    loading: {
      name: 'Loading',
      control: {
        type: 'boolean',
      },
    },
    linksInNewTab: {
      name: 'Open Links In New Tab',
      control: {
        type: 'boolean',
      },
    },
  },
}

export default meta

// This is actual output from the GitHub Markdown /preview endpoint:
const sampleHtml = `
<h3>Sample markdown</h3>
<h4>Formatted text</h4>
<ul>
<li><strong>bold</strong></li>
<li><em>italic</em></li>
<li><code class="notranslate">inline code</code></li>
</ul>
<blockquote>
<p>quote</p>
</blockquote>
<pre class="notranslate"><code class="notranslate">code block
</code></pre>
<h4>Links</h4>
<ul>
<li><a href="https://github.com">GitHub</a></li>
<li><a href="https://primer.style" rel="nofollow">Primer</a></li>
<li><a href="https://www.githubuniverse.com/" rel="nofollow">Universe</a></li>
</ul>
<h4>Tasks</h4>
<ul class="contains-task-list">
<li class="task-list-item"><label><input type="checkbox" id="" disabled="" class="task-list-item-checkbox"> Task 1</label></li>
<li class="task-list-item"><label><input type="checkbox" id="" disabled="" class="task-list-item-checkbox"> Task 2</label></li>
<li class="task-list-item"><label><input type="checkbox" id="" disabled="" class="task-list-item-checkbox"> Task 3</label></li>
</ul>` as SafeHTMLString

const htmlString = sampleHtml

const sampleMarkdownSource = `
### Sample markdown

#### Formatted text

- **bold**
- _italic_
- \`inline code\`

> quote

\`\`\`
code block
\`\`\`

#### Links

- [GitHub](https://github.com)
- [Primer](https://primer.style)
- [Universe](https://www.githubuniverse.com/)

#### Tasks

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3`

export const Default = ({loading}: ArgProps) => (
  <NewMarkdownViewer verifiedHTML={htmlString} markdownValue={sampleMarkdownSource} loading={loading} />
)

export const Playground = ({loading}: ArgProps) => {
  const [markdown, setMarkdown] = useState(sampleMarkdownSource)
  const [disabled, setDisabled] = useState(false)

  // Any state-setting inside a debounced function and/or after an async call should be done safely
  // to avoid setting state after the component unmounts
  const safeSetDisabled = useSafeAsyncCallback(setDisabled)

  const saveChanges = useCallback(async () => {
    // Disable interaction for the duration of the request to avoid conflicts
    safeSetDisabled(true)
    // In production this would make an API request to save the markdown and update the rendered HTML
    await new Promise(r => setTimeout(r, 500))
    safeSetDisabled(false)
  }, [safeSetDisabled])

  // saveChanges itself must also be called safely to avoid accidentally calling an outdated reference
  // Important to allow calling after unmount to avoid loss of data if the component unmounts before saving
  const safeSaveChanges = useSafeAsyncCallback(saveChanges, true)

  // We always want to debounce the request to avoid disabling checkboxes in between every click
  const debouncedSaveChanges = useMemo(() => debounce(safeSaveChanges, 1000), [safeSaveChanges])

  return (
    <NewMarkdownViewer
      verifiedHTML={htmlString}
      markdownValue={markdown}
      onChange={md => {
        setMarkdown(md)
        debouncedSaveChanges()
      }}
      disabled={disabled}
      loading={loading}
    />
  )
}

export const Interactive = ({loading}: ArgProps) => {
  const [markdown, setMarkdown] = useState(sampleMarkdownSource)
  const [disabled, setDisabled] = useState(false)

  // Any state-setting inside a debounced function and/or after an async call should be done safely
  // to avoid setting state after the component unmounts
  const safeSetDisabled = useSafeAsyncCallback(setDisabled)

  const saveChanges = useCallback(async () => {
    // Disable interaction for the duration of the request to avoid conflicts
    safeSetDisabled(true)
    // In production this would make an API request to save the markdown and update the rendered HTML
    await new Promise(r => setTimeout(r, 500))
    safeSetDisabled(false)
  }, [safeSetDisabled])

  // saveChanges itself must also be called safely to avoid accidentally calling an outdated reference
  // Important to allow calling after unmount to avoid loss of data if the component unmounts before saving
  const safeSaveChanges = useSafeAsyncCallback(saveChanges, true)

  // We always want to debounce the request to avoid disabling checkboxes in between every click
  const debouncedSaveChanges = useMemo(() => debounce(safeSaveChanges, 1000), [safeSaveChanges])

  return (
    <NewMarkdownViewer
      verifiedHTML={htmlString}
      markdownValue={markdown}
      onChange={md => {
        setMarkdown(md)
        debouncedSaveChanges()
      }}
      disabled={disabled}
      loading={loading}
    />
  )
}
