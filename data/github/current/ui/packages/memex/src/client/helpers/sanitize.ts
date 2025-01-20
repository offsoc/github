import type {SafeHTMLString} from '@github-ui/safe-html'
import DOMPurify, {type Config} from 'dompurify'

// DOM PURIFY CONFIGURATION
// docs: https://github.com/cure53/DOMPurify

// Use this config to add "global" sanitization rules
// to every other sanitization config object
const SHARED_SANITIZATION_CONFIG: Readonly<Config> = {
  FORBID_TAGS: ['style'],
  ALLOW_DATA_ATTR: false,
}

const TEXT_SANITIZATION_CONFIG: Readonly<Config> = {
  ...SHARED_SANITIZATION_CONFIG,

  // Using ALLOWED_TAGS instead of ADD_TAGS overrides the
  // default DOMPurify config, making only the tags explicitly
  // allowed by this config to be considered safe
  ALLOWED_TAGS: [
    // a: allowed in memex text custom fields
    'a',
    '#text',
    // img and g-emoji to support github emojis
    'img',
    'g-emoji',
    // to allow code inside issue/pr titles
    'code',
  ],
  ADD_ATTR: [
    // attributes for g-emoji component
    'alias',
    'fallback-src',
  ],
  FORBID_ATTR: ['style'],
  KEEP_CONTENT: true,
}

// This config uses DOMPurify default allowed tags/attrs and adds
// the custom tags and attrs used in the rendered result of GitHub Flavored Markdown
// - default allowed tags: https://github.com/cure53/DOMPurify/blob/main/src/tags.js
// - default allowed attrs: https://github.com/cure53/DOMPurify/blob/main/src/attrs.js
const RENDERED_MARKDOWN_SANITIZATION_CONFIG: Readonly<Config> = {
  ...SHARED_SANITIZATION_CONFIG,

  ADD_TAGS: [
    'action-menu',
    'anchored-position',
    'auto-complete',
    'focus-group',
    'g-emoji',
    'tracking-block',
    'tracking-block-omnibar',
    'tasklist-block-title',
    'details-menu',
    // GH math expressions
    // https://docs.github.com/get-started/writing-on-github/working-with-advanced-formatting/writing-mathematical-expressions
    'math-renderer',
    // classic task lists support
    'task-lists',
    // used by unfurled labels
    // https://docs.github.com/get-started/writing-on-github/working-with-advanced-formatting/autolinked-references-and-urls#labels
    'tool-tip',
    'turbo-frame',
    'modal-dialog',
    // Used by tasklist-block-title
    'primer-text-field',
  ],
  ADD_ATTR: [
    // attributes for g-emoji components
    'alias',
    'anchor',
    'anchor-offset',
    'fallback-src',
    // attributes for hovercard attributes attached to anchor tags
    'data-hovercard-type',
    'data-hovercard-url',
    'data-octo-click',
    'data-octo-dimensions',
    // attributes for mermaidjs rich rendering
    'data-identity',
    'data-host',
    'data-src',
    'data-content',
    'data-type',
    'data-json',
    'data-plain',
    // attributes for tracking-block
    'data-id',
    'data-issue',
    'data-draft-issue',
    'data-item-uuid',
    'data-item-id',
    'data-item-title',
    'data-item-state',
    'data-item-position',
    'data-menu-type',
    'data-repository-id',
    'data-repository-name',
    'data-show-dialog-id',
    'data-close-dialog-id',
    'data-modal-dialog-overlay',
    'data-display-number',
    'data-hydro-click-hmac',
    'data-hydro-click-payload',
    'data-hydro-click',
    'data-tracking-block-item-title',
    'data-tracking-block-convert-button',
    'data-tracking-block-remove-button',
    'data-tracking-block-draft-title',
    'data-form-tracking-block-update',
    'data-completion-completed',
    'data-completion-total',
    'data-response-source-type',
    'data-query-type',
    'data-precache',
    // attributes for task-lists
    'sortable',
    // attributes for catalyst
    'data-view-component',
    'data-catalyst',
    'data-action',
    'data-target',
    'data-targets',
    // attributes for enriched video element rendered in issue body or comments
    'data-canonical-src',
    // attributes for mathjax
    'data-static-url',
    'mnemonics',
    'popover',
    'popovertarget',
    'retain',
    'side',
  ],
  // NOTE: even though the data-action doesn't use URIs, the fact that it possibly
  //       includes a colon causes the dompurify to detect it as a URI and remove it if it's not
  //       add as a URI SAFE ATTR. (more info: https://github.github.io/catalyst/guide/actions/)
  // NOTE: data-item-title is used by the tracking block component and the attribute was being
  //       sanitized out if the title included a colon
  ADD_URI_SAFE_ATTR: ['data-action', 'data-item-title', 'data-plain', 'data-host', 'data-content', 'data-json'],
}

/** Domains which are controlled by GitHub and considered safe to allow linking to. */
const GITHUB_CONTROLLED_DOMAINS = new Set([
  'github.com',
  'githubusercontent.com',
  'githubassets.com',
  'github.localhost',
  'ghe.com',
  'ghe.localhost',
])

/** Subdomains that should be allowed when subdomain isolation is enabled in GHES */
const GHES_SUBDOMAINS = new Set(['media', 'uploads', 'assets', 'avatars'])

// recommended approach for ensuring all sanitized links open in a new window
// https://github.com/cure53/DOMPurify/tree/2ac080246d7ee977cb820abfa1990a683692ce09/demos#hook-to-open-all-links-in-a-new-window-link
const sanitizeNewWindowLinks = (node: Element) => {
  // set all elements owning target to target=_blank
  if ('target' in node || node instanceof HTMLAnchorElement) {
    node.setAttribute('target', '_blank')
    // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
    node.setAttribute('rel', 'noopener noreferrer')
  }
  // set non-HTML/MathML links to xlink:show=new
  // eslint-disable-next-line github/get-attribute
  if (!node.hasAttribute('target') && (node.hasAttribute('xlink:href') || node.hasAttribute('href'))) {
    // eslint-disable-next-line github/get-attribute
    node.setAttribute('xlink:show', 'new')
  }
}

// Only allow images from github-controlled domains to be linked from images. The intention here is to allow for our
// custom images like :octocat: to be shown, not to allow any user-controlled image to be shown. Note that this is not
// really a security concern, regardless of the URI, as the content is still filtered with DOMPurify. We are just removing
// unexpected hostnames for the sake of being explicit in what we support.
const sanitizeNonGitHubImageLinks = (node: Element) => {
  if (node.tagName === 'IMG') {
    const imageSrc = node.getAttribute('src')
    if (imageSrc) {
      try {
        const url = new URL(imageSrc, document.baseURI)
        const urlParts = url.hostname.split('.')
        if (urlParts.length >= 2) {
          const baseDomain = `${urlParts.at(-2)}.${urlParts.at(-1)}`
          // Allow github-controlled domains explicitly, and nothing else
          // Based on the set of supported URIs in our Content Security Policy
          if (GITHUB_CONTROLLED_DOMAINS.has(baseDomain)) return
          // Check for relative URL
          const isRelativeURL = new URL(document.baseURI).origin === new URL(imageSrc, document.baseURI).origin
          if (isRelativeURL) return
          // Also allow the current GitHub URL
          const githubUrlScript = document.getElementById('github-url')
          if (githubUrlScript) {
            const githubUrl = new URL(githubUrlScript.textContent ?? '')
            const validSubdomains = Array.from(GHES_SUBDOMAINS.values()).map(
              subdomain => `${subdomain}.${githubUrl.hostname}`,
            )
            if (validSubdomains.includes(url.hostname)) return
          }
        }
        node.parentNode?.removeChild(node)
      } catch {
        // If the URL fails to parse for some reason, we just remove the element
        node.parentNode?.removeChild(node)
      }
    }
  }
}

const purifier = DOMPurify()
purifier.addHook('afterSanitizeAttributes', sanitizeNewWindowLinks)
purifier.addHook('afterSanitizeElements', sanitizeNonGitHubImageLinks)

// Purifier that does not perform image link sanitization
const nonImagePurifier = DOMPurify()
nonImagePurifier.addHook('afterSanitizeAttributes', sanitizeNewWindowLinks)

export function sanitizeTextInputHtmlString(html: string) {
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return purifier.sanitize(html, TEXT_SANITIZATION_CONFIG).toString()
}

export function sanitizeRenderedMarkdown(
  html: string,
  {skipImageSanitization = false}: {skipImageSanitization?: boolean} = {},
) {
  if (skipImageSanitization) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return nonImagePurifier.sanitize(html, RENDERED_MARKDOWN_SANITIZATION_CONFIG).toString() as SafeHTMLString
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  return purifier.sanitize(html, RENDERED_MARKDOWN_SANITIZATION_CONFIG).toString() as SafeHTMLString
}
