import {MarkdownQuote} from '@github/quote-selection'

import {CLASS_NAMES, IDS, withClassSelector, withIDSelector} from '../constants/dom-elements'

export function getQuotedText(text: string): string {
  if (!text) return text

  const lines = text.split('\n')

  let quotes = ''
  for (const line of lines) {
    quotes = quotes.concat(`> ${line}\n`)
  }

  return quotes
}

export type SelectionContext = {
  anchorNode: Node | null
  range: Range
}

const replaceCommentAssets =
  (commentBodyContent: string) =>
  (selection: string): string => {
    // Let's break this regex down:
    // !\[[^[]+?\] - match the first part (e.g. ![image]), in a safe way
    // \([^()]+\/ - match the opening parenthesis and anything before the UUID, until the last slash
    // ([\w\d-]+) - match the UUID
    // We keep matching the rest of the string without matching the closing parenthesis to keep the regex safe.
    const links = commentBodyContent.matchAll(/(!\[[^[]+?\]\([^()]+\/)([\w\d-]+)(.+)/g)
    for (const link of links) {
      const beforeUuid = link[1]
      const uuid = link[2]
      const afterUuid = link[3]

      if (!beforeUuid || !uuid || !afterUuid) continue
      const url = `${beforeUuid}${uuid}${afterUuid.split(')')[0]})`

      const selectionMatches = selection.split(uuid)

      if (selectionMatches.length < 2) continue

      const beforeUuidSelection = selectionMatches[0]?.match(/!\[[^[]+$/)
      const afterUuidSelection = selectionMatches[1]?.split(')')[0]
      const toReplace = `${beforeUuidSelection}${uuid}${afterUuidSelection})`

      selection = selection.replaceAll(toReplace, url)
    }
    return selection
  }

// Not a comprehensive check, but should cover the cases we encountered with hidden
// elements for screen readers.
// Although aria-hidden does not actually hide the element, we use it to hide the "Move this" element in a list,
// and aria hidden elements should probably not be quoted.
const isElementHidden = (element: HTMLElement) => {
  return element.style.display === 'none' || element.style.visibility === 'hidden' || element.ariaHidden === 'true'
}

// We don't want hidden elements to show up in the quoted text, so we remove them
// from the fragment before processing it. For example, elements intended only to
// be read by screen readers.
const removeHiddenElements = (fragment: DocumentFragment) => {
  const nodeIterator = document.createNodeIterator(fragment, NodeFilter.SHOW_ELEMENT, {
    acceptNode() {
      return NodeFilter.FILTER_ACCEPT
    },
  })
  let node = nodeIterator.nextNode()

  while (node) {
    if (node instanceof HTMLElement && isElementHidden(node)) {
      node.remove()
    }
    node = nodeIterator.nextNode()
  }
}

export function selectQuoteFromComment(
  comment: HTMLDivElement | null | undefined,
  selection: SelectionContext | null,
  // Content of the body from the data store, which should have presigned asset urls
  // See https://github.com/github/issues/issues/10490
  commentBodyContent?: string,
): string | undefined {
  if (!comment) return undefined

  const quoteSelectionContainer = document.querySelector(withClassSelector(CLASS_NAMES.commentsContainer))!

  const commentBody = comment.querySelector<HTMLElement>(withClassSelector(CLASS_NAMES.markdownBody))!

  const quote = new MarkdownQuote('', removeHiddenElements)

  if (
    selection &&
    commentBody.contains(selection.anchorNode) &&
    commentBody.contains(selection.range.startContainer) &&
    commentBody.contains(selection.range.endContainer) &&
    !selection.range.collapsed &&
    selection.range.toString().trim() !== ''
  ) {
    // If the selection is within the comment body, use it
    quote.range = selection.range
  } else {
    // Otherwise, use the entire comment body
    quote.select(commentBody)
  }

  if (commentBodyContent) {
    quote.processSelectionTextFn = replaceCommentAssets(commentBodyContent)
  }

  if (quoteSelectionContainer) {
    const commentComposer = quoteSelectionContainer.querySelector<HTMLElement>(withIDSelector(IDS.issueCommentComposer))
    const commentComposerTextArea = commentComposer?.querySelector<HTMLTextAreaElement>('textarea')
    if (commentComposerTextArea) {
      quote.insert(commentComposerTextArea)
      return commentComposerTextArea.value
    }
  }

  return undefined
}
