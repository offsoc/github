type ScrollToOptions = {
  top: number
  left?: number
}

export default function scrollTo(targetContainer: HTMLElement, options: ScrollToOptions) {
  let container: Node = targetContainer
  const document = targetContainer.ownerDocument

  if (
    container === document ||
    // @ts-expect-error - Suppress TS2367 error that I don't trust
    container === document.defaultView ||
    container === document.documentElement ||
    container === document.body
  ) {
    container = document
  }

  if (!document.defaultView) return

  const Document = document.defaultView.Document

  if (container instanceof Document) {
    const top = options.top != null ? options.top : document.defaultView.pageYOffset
    const left = options.left != null ? options.left : document.defaultView.pageXOffset
    document.defaultView.scrollTo(left, top)
    return
  }

  const HTMLElement = document.defaultView.HTMLElement

  if (!(container instanceof HTMLElement)) {
    throw new Error('invariant')
  }

  container.scrollTop = options.top
  if (options.left != null) {
    container.scrollLeft = options.left
  }
}
