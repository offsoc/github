import './copilot-inline-diff-element'

import type {SafeHTMLString} from '@github-ui/safe-html'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import type {TokenizerAndRendererExtension, Tokens} from 'marked'
import {lexer, Marked} from 'marked'
import {markedHighlight} from 'marked-highlight'

import styles from '../components/ChatMessage.module.css'
import {reactReplaceElementPrefix} from '../components/ReactMarkdownRenderer'
import {copilotFeatureFlags} from '../utils/copilot-feature-flags'
import type {
  CopilotAnnotations,
  CopilotChatAgent,
  CopilotChatReference,
  NumberedCopilotChatReference,
  SnippetReference,
  WebSearchReference,
} from './copilot-chat-types'

const TEXT_SANITIZATION_CONFIG = {
  ALLOWED_TAGS: [
    'a',
    'blockquote',
    'br',
    'p',
    'ul',
    'ol',
    'li',
    'pre',
    'code',
    'table',
    'tr',
    'th',
    'td',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'span',
    'strong',
    'em',
    'p',
    'div',
    'details',
    'summary',
    'copilot-inline-diff',
  ],
  FORBID_TAGS: ['style'],
  ADD_URI_SAFE_ATTR: ['colspan'],
  ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'colspan'],
  ALLOW_DATA_ATTR: false,
  ALLOWED_URI_REGEXP: /^https?:/i,
}

function linkifyAtMention(
  inputString: string,
  agents?: CopilotChatAgent[],
  fetchAgents?: () => Promise<CopilotChatAgent[]>,
) {
  // Use regex to find a substring beginning with '@' at the beginning of the string.
  const atMentions = inputString.match(/^@\S+/g)

  // If there is not an '@' mentions, return the original string.
  if (!atMentions || atMentions.length === 0) {
    return inputString
  }

  if (!agents) {
    // fetch the agents, but don't hold up showing the message.
    void fetchAgents?.()
    return inputString
  }

  // There should only be a single mention.
  const mention = atMentions[0]

  // If the agents array contains the mention without the '@'
  const mentionSlug = mention.substring(1)
  const matchingAgent = agents.find(agent => agent.slug === mentionSlug)
  if (matchingAgent) {
    // Replace the mention in the original string with an HTML anchor tag
    const sanitizedMention = DOMPurify.sanitize(mention)
    inputString = inputString.replace(
      mention,
      // eslint-disable-next-line github/unescaped-html-literal
      `<a href="${matchingAgent.integrationUrl}" data-hovercard-url="/integrations/${mentionSlug}/hovercard" class="bgColor-accent-muted">${sanitizedMention}</a>`,
    )
  }
  return inputString
}

export function transformContentToHTML(
  body: string | undefined,
  references?: CopilotChatReference[] | null,
  extensions?: TokenizerAndRendererExtension[],
  isAssistive?: boolean,
  agents?: CopilotChatAgent[],
  fetchAgents?: () => Promise<CopilotChatAgent[]>,
  startLine?: number,
  endLine?: number,
): SafeHTMLString {
  if (!body) return '' as SafeHTMLString

  if (startLine) {
    // add highlight markers
    const offsets = findLines(body, startLine, endLine)
    if (offsets.endIndex > -1) {
      body = body.slice(offsets.startIndex, offsets.endIndex)
    }

    // remove front matter
    body = body.replace(/^---\n[\s\S]*?\n---\n/, '')
  }

  if (!copilotFeatureFlags.reactMarkdown) {
    // replace agent @mention with anchor
    body = linkifyAtMention(body, agents, fetchAgents)
  }

  const renderer = new Marked(
    {
      gfm: true,
      extensions: [
        codeCopyButtonExtension,
        ...(copilotFeatureFlags.formatDiff ? [diffHunkExtension] : []),
        ...(extensions ?? []),
      ],
    },
    markedHighlight({
      langPrefix: 'hljs language-',
      highlight(code) {
        return hljs.highlightAuto(code).value
      },
    }),
  )

  const unsafeHTML = renderer.parse(body) as string
  const purify = DOMPurify()
  if (copilotFeatureFlags.reactMarkdown) {
    // Allow id's starting with our react-replace prefix
    purify.addHook('uponSanitizeAttribute', function (_, data) {
      if (data.attrName !== 'id') return
      if (data.attrValue.startsWith(reactReplaceElementPrefix)) {
        data.forceKeepAttr = true
      }
    })
  }
  // Allow data-hovercard-url
  purify.addHook('uponSanitizeAttribute', function (_, data) {
    if (data.attrName !== 'data-hovercard-url') return
    data.forceKeepAttr = true
  })
  // Allow href on @mentions
  purify.addHook('uponSanitizeAttribute', function (node, data) {
    if (data.attrName !== 'href') return
    if (node.getAttribute('data-hovercard-url') !== null) {
      data.forceKeepAttr = true
    }
  })
  // Allow class on @mentions
  purify.addHook('uponSanitizeAttribute', function (_, data) {
    if (data.attrName !== 'class') return
    if (data.attrValue === 'bgColor-accent-muted') {
      data.forceKeepAttr = true
    }
  })
  // Allow classes for syntax highlighting (`hljs` and `language-`)
  purify.addHook('uponSanitizeAttribute', function (_, data) {
    if (data.attrName !== 'class') return

    const ALLOWED_LIST = ['file', 'hljs', 'snippet-clipboard-content']
    const ALLOWED_REGEX = /^(hljs|language-|\bsnippet-vulnerabilit(y|ies)\b-|\b(blob|diff|file)-)/
    // remove all classes that don't match our allowed list

    data.attrValue = data.attrValue
      .split(' ')
      .filter(className => ALLOWED_LIST.includes(className) || ALLOWED_REGEX.test(className))
      .join(' ')

    // if there are no classes left, remove the attribute
    if (data.attrValue === '') {
      data.keepAttr = false
    }
  })
  // Allow data-snippet-clipboard-copy-content for copying code blocks
  purify.addHook('uponSanitizeAttribute', function (node, data) {
    const clipboardAttr = 'data-snippet-clipboard-copy-content'
    if (data.attrName !== clipboardAttr) return
    // ensuring that the value starts with our nonce so we know it came from our code
    if (!data.attrValue.startsWith(`${getNonce()}:`)) {
      data.keepAttr = false
      return
    }
    // remove the nonce
    data.attrValue = data.attrValue.slice(getNonce().length + 1)
    // forceKeepAttr doesn't set the attribute's value to the new data.attrValue so we do it instead
    node.setAttribute(clipboardAttr, data.attrValue)
    data.forceKeepAttr = true
  })
  // Allow data attributes for inline diffs
  purify.addHook('uponSanitizeAttribute', function (node, data) {
    if (node.nodeName === 'COPILOT-INLINE-DIFF' && data.attrName.startsWith('data-')) {
      data.forceKeepAttr = true
    }
  })
  // munge links
  purify.addHook('afterSanitizeAttributes', function (node) {
    // set all elements owning target to target=_blank if in immersive
    if (('target' in node || node instanceof HTMLAnchorElement) && !isAssistive) {
      node.setAttribute('target', '_blank')
      // prevent https://www.owasp.org/index.php/Reverse_Tabnabbing
      node.setAttribute('rel', 'noopener noreferrer')
    }

    // set non-HTML/MathML links to xlink:show=new
    if (
      !node.hasAttribute('target') &&
      // eslint-disable-next-line github/get-attribute
      (node.hasAttribute('xlink:href') || node.hasAttribute('href')) &&
      !isAssistive
    ) {
      // eslint-disable-next-line github/get-attribute
      node.setAttribute('xlink:show', 'new')
    }

    // add classes to prettify links to certain resources
    if (node instanceof HTMLAnchorElement) {
      const originalHref = node.getAttribute('href')
      if (originalHref) {
        let href = unabsoluteUrl(originalHref)
        if (href.startsWith('/')) {
          href = href.slice(1)
          const parts = href.split('/')
          // file (/primer/react/blob/main/packages/react/src/Box/Box.tsx)
          if (parts.length > 3 && parts[2] === 'blob') {
            // snippet (/primer/react/blob/main/packages/react/src/Box/Box.tsx#L17-L24)
            if (parts[parts.length - 1]?.match(/#L\d+(-L\d+)?$/)) {
              node.classList.add(styles.snippet, styles['icon-link'])
            } else {
              node.classList.add(styles.file, styles['icon-link'])
            }
          }
          // commit (/primer/react/commit/a3355a5483e37bebe077c7aa000ae8e4ed0f77b9)
          if (parts.length === 4 && parts[2] === 'commit' && parts[3]?.match(/^[0-9a-f]{40}$/i)) {
            node.classList.add(styles.commit, styles['icon-link'])
          }
        }
        // bing result
        const bingRefs = references?.filter(ref => ref.type === 'web-search') as WebSearchReference[] | null
        if (bingRefs?.some(ref => ref.results.some(result => result.url === originalHref))) {
          node.classList.add(styles.bing, styles['color-icon-link'])
        }
      }
    }
  })

  return purify.sanitize(unsafeHTML, TEXT_SANITIZATION_CONFIG) as SafeHTMLString
}

let nonce: string | undefined
function getNonce(): string {
  if (!nonce) {
    nonce = crypto.randomUUID()
  }
  return nonce
}

let codeCopyButtonRendering = false
/** Modifies code blocks so that they can have a copy button */
const codeCopyButtonExtension: TokenizerAndRendererExtension = {
  name: 'code',
  renderer(token) {
    if (token.type !== 'code' || codeCopyButtonRendering) return false
    const codeToken = token as Tokens.Code
    codeCopyButtonRendering = true
    // this will render the code block so we set codeCopyButtonRendering so that we return false
    // to trigger the default rendering and not an infinite loop
    const html = this.parser.parse([codeToken])
    codeCopyButtonRendering = false
    const container = document.createElement('span')
    container.innerHTML = html
    const content = token.raw.replace(/^```\w*\n/, '').replace(/\n```\n?$/, '')
    // setting this data attribute is what triggers the behavior to add the clipboard button
    container.setAttribute('data-snippet-clipboard-copy-content', `${getNonce()}:${content}`)
    container.classList.add('snippet-clipboard-content')
    return container.outerHTML
  },
}

/** Replaces diff code blocks with a stylized diff */
const diffHunkExtension: TokenizerAndRendererExtension = {
  name: 'code',
  renderer(token) {
    if (token.type !== 'code') return false
    let codeToken = token as Tokens.Code

    // This regex will pull out the language and filepath
    const [, lang = '', filepath = ''] = (codeToken.lang ?? '').match(/^(\S*)\s*(.*)$/) ?? []
    if (lang !== 'diff') return false

    // Re-parse the code block without highlighting
    codeToken = lexer(codeToken.raw, {gfm: true})[0] as Tokens.Code

    const element = document.createElement('copilot-inline-diff')
    element.setAttribute('data-diff', codeToken.text)
    element.setAttribute('data-filepath', filepath)
    return element.outerHTML
  },
}

export function transformContentToHTMLWithAnnotations(
  markdown: string | undefined,
  references: CopilotChatReference[] | null,
  annotations?: CopilotAnnotations,
  isAssistive?: boolean,
  agents?: CopilotChatAgent[],
  fetchAgents?: () => Promise<CopilotChatAgent[]>,
): SafeHTMLString {
  if (!markdown) return '' as SafeHTMLString
  if (!annotations?.CodeVulnerability)
    return transformContentToHTML(markdown, references, [], isAssistive, agents, fetchAgents)

  const isCodeToken = (token: Tokens.Generic): token is Tokens.Code => token.type === 'code'
  const pluralizeVulnerability = (count: number): string =>
    count === 1 ? `${count} vulnerability` : `${count} vulnerabilities`
  const {CodeVulnerability: vulnerabilities} = annotations

  const vulnerabilitiesContent = vulnerabilities.map(v => {
    const {startOffset, endOffset} = v
    const content = markdown.substring(startOffset, endOffset + 1)
    return content
  })

  let vulnerabilityDisclaimerRendering = false
  const codeVulnerabilityExtension: TokenizerAndRendererExtension = {
    name: 'code',
    renderer(token) {
      if (!isCodeToken(token) || vulnerabilityDisclaimerRendering || !annotations?.CodeVulnerability) {
        return false
      }

      vulnerabilityDisclaimerRendering = true
      const tokenHasAnnotation = vulnerabilitiesContent.some(string => token.raw.includes(string))
      const html = this.parser.parse([token])
      vulnerabilityDisclaimerRendering = false

      if (tokenHasAnnotation) {
        const container = document.createElement('div')
        const codeContent = document.createElement('div')
        codeContent.classList.add('snippet-vulnerability-code')
        codeContent.innerHTML = html

        const vulnerabilitiesDetails = document.createElement('details')
        vulnerabilitiesDetails.classList.add('snippet-vulnerabilities-details')
        const vulnerabilitiesSummary = document.createElement('summary')
        const chevron = document.createElement('div')
        chevron.classList.add('snippet-vulnerability-chevron')
        const shield = document.createElement('div')
        shield.classList.add('snippet-vulnerability-shield-icon')

        vulnerabilitiesSummary.textContent = `${pluralizeVulnerability(vulnerabilitiesContent.length)} detected`
        vulnerabilitiesSummary.prepend(shield)
        vulnerabilitiesSummary.appendChild(chevron)
        vulnerabilitiesSummary.classList.add('snippet-vulnerability-summary')

        vulnerabilitiesDetails.appendChild(vulnerabilitiesSummary)

        for (const v of vulnerabilities) {
          const vulnerability = document.createElement('div')
          vulnerability.classList.add('snippet-vulnerability-details')
          const vulnerabilityTitle = document.createElement('p')
          vulnerabilityTitle.classList.add('snippet-vulnerability-details-title')
          const vulnerabilityDescription = document.createElement('p')
          vulnerabilityDescription.classList.add('snippet-vulnerability-details-description')
          vulnerabilityTitle.textContent = v.details.uiType
          vulnerabilityDescription.textContent = v.details.uiDescription
          vulnerability.append(vulnerabilityTitle, vulnerabilityDescription)
          vulnerabilitiesDetails.appendChild(vulnerability)
        }

        container.append(codeContent, vulnerabilitiesDetails)

        return container.outerHTML
      } else {
        return html
      }
    },
  }

  return transformContentToHTML(markdown, references, [codeVulnerabilityExtension], isAssistive, agents, fetchAgents)
}

export function transformContentToHTMLWithCitations(
  markdown: string | undefined,
  references: CopilotChatReference[] | null,
  isAssistive?: boolean,
  agents?: CopilotChatAgent[],
  fetchAgents?: () => Promise<CopilotChatAgent[]>,
): {html: SafeHTMLString; hasCitations: boolean; referenceMap: Map<number, number>} {
  if (!markdown) {
    return {html: '' as SafeHTMLString, hasCitations: false, referenceMap: new Map<number, number>()}
  }
  if (!references || references.length === 0) {
    markdown = `We could not find anything related to your query in your selected knowledge base.
    Copilot will try its best to answer your question but
    risks of fabrication are higher without grounding in documentation.\n\n${markdown}`
    references = []
  }

  const newCitationRegex = /\[CitationID: ?(?<id>[0-9]{1,3})\](?!\()/i
  const useNewCitations = newCitationRegex.test(markdown)
  const citationRegex = useNewCitations ? newCitationRegex : /\[\^?(?<id>[0-9]{1,3})\^?\](?!\()/
  const citationRegexAnchored = new RegExp(`^${citationRegex.source}`, citationRegex.flags)
  let hasCitations = false

  /** a map of citation numbers in the source to the citation number we'll display */
  let referenceMap: Map<number, number>
  // don't rewrite citations if we're using old citation style
  if (!useNewCitations) {
    referenceMap = new Map(Array.from({length: references.length}, (_, i) => [i + 1, i + 1]))
  } else {
    referenceMap = new Map<number, number>()
  }

  const citationExtension: TokenizerAndRendererExtension = {
    name: 'citation',
    level: 'inline',
    start(src: string) {
      // find the next citation
      return src.match(citationRegex)?.index
    },
    tokenizer(src: string) {
      // consume some text, return a citation
      const match = citationRegexAnchored.exec(src)
      if (match) {
        const id = match.groups?.id
        if (id) {
          return {
            type: 'citation',
            raw: match[0],
            id,
          }
        }
      }
    },
    renderer(token) {
      // generate html for a citation
      const link = document.createElement('a')
      const n = parseInt(token.id as string)
      const reference = references[n - 1]
      if (!reference) {
        return token.raw
      }
      const url = (reference as SnippetReference).url
      if (!url) {
        return token.raw
      }
      hasCitations = true
      if (!referenceMap.has(n)) {
        referenceMap.set(n, referenceMap.size + 1)
      }
      const displayIndex = referenceMap.get(n)!

      link.setAttribute('href', url)
      link.textContent = `[${displayIndex}]`
      return link.outerHTML
    },
  }
  const html = transformContentToHTML(markdown, references, [citationExtension], isAssistive, agents, fetchAgents)
  return {html, hasCitations, referenceMap}
}

export function numberReferences(
  references: CopilotChatReference[],
  referenceMap: Map<number, number> | null,
): NumberedCopilotChatReference[] {
  if (!referenceMap) {
    return references.map((ref, i) => ({...ref, n: i + 1}))
  }
  const out = [] as NumberedCopilotChatReference[]
  for (const [a, b] of referenceMap.entries()) {
    const ref = references[a - 1]!
    out.push({...ref, n: b})
  }
  out.sort((a, b) => a.n - b.n)
  return out
}

/** finds the character index of the start of the start line (starting from 1) and the end of the end line */
function findLines(str: string, startLine: number, endLine = startLine - 1) {
  let index = -1
  let startIndex = -1
  let endIndex = -1

  // eslint-disable-next-line no-constant-condition
  for (let i = 1; true; i++) {
    if (i === startLine) {
      startIndex = index + 1
    }
    if (i === endLine + 1) {
      endIndex = index
      break
    }
    index = str.indexOf('\n', index + 1)
    if (index === -1) {
      break
    }
  }

  return {startIndex, endIndex}
}

/**
 * If `to` is an absolute URL, convert it to a relative URL if it's on the same origin. Otherwise returns it unmodified.
 *
 * e.g. if you're on "https://github.com/foo/bar" and you pass in "https://github.com/biz/baz", it will return /biz/baz.
 */
function unabsoluteUrl(to: string) {
  if (to.match(/^https?:\/\//)) {
    let url: URL
    try {
      url = new URL(to, window.location.href)
    } catch {
      // if it's not a valid URL, don't worry about it
      return to
    }
    if (url.origin === window.location.origin) {
      return url.pathname + url.search + url.hash
    }
  }
  return to
}
