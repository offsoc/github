import {ContentType} from '../platform/content-type'
import {parseTextFromHtmlStr} from './parsing'

const HtmlBlob = (...parts: Array<string>) => new Blob(parts, {type: ContentType.HTML})

const TextBlob = (...parts: Array<string>) => new Blob(parts, {type: ContentType.Text})

/**
 * If the browser supports it, construct a `ClipboardItem` from the given content.
 * @note In practice, only `text/html`, `text/plain`, and `image/png` content types are widely supported.
 */
const SafeClipboardItem = (...blobs: Array<Blob>) =>
  typeof ClipboardItem === 'undefined'
    ? null // browser doesn't support the API
    : new ClipboardItem(Object.fromEntries(blobs.map(blob => [blob.type, blob])))

function copyText(text: string): Promise<void> {
  // At this point there's no alternatives, we have to give up
  if (typeof navigator.clipboard?.writeText === 'undefined') throw new Error('Copying is not supported in this browser')
  return navigator.clipboard.writeText(text)
}

/**
 * Copy rich HTML to the clipboard, if the browser supports it. This content could then be pasted by the user into a
 * rich text editor with formatting preserved.
 * @param html The rich HTML to copy.
 * @param plainText The plain text alternative to the HTML. This plain text will be used when pasting into plain text
 * editors and in browsers that don't yet support the rich clipboard API.
 *
 * If not provided, the html will be parsed to extract the text content of the nodes, but this may not be as useful as
 * a custom text alternative. For example, you might want to provide a CSV form of an HTML table.
 * @returns a `Promise` that resolves on success or rejects on failure, which may include a user permissions failure.
 * Failure is an expected path and should be handled, usually with a toast.
 */
export function copyHtml(html: string, plainText: string = parseTextFromHtmlStr(html)): Promise<void> {
  // We have to be excessively safe here because some browsers (Firefox 👀) don't support the rich clipboard API
  // Google docs just recommend checking for `navigator.clipboard` existence, but that doesn't work because Firefox
  // supports _some_ but not all of the `navigator.clipboard` API

  const item = SafeClipboardItem(HtmlBlob(html), TextBlob(plainText))

  if (!item || typeof navigator.clipboard?.write === 'undefined') {
    // browser doesn't support rich copying
    return copyText(plainText)
  } else {
    return navigator.clipboard.write([item])
  }
}
