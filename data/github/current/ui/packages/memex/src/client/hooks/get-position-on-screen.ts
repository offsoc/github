import {not_typesafe_nonNullAssertion} from '../helpers/non-null-assertion'

export type XEdge = 'left' | 'center' | 'right'
export type YEdge = 'top' | 'middle' | 'bottom'
interface UsePositionProps {
  originRef: React.RefObject<Element>
  contentRef: React.RefObject<Element>
  contentWidth?: number
  contentHeight?: number
  alignment?: {
    xAlign?: XEdge
    xOriginEdgeAlign?: XEdge
    yAlign?: YEdge
    yOriginEdgeAlign?: YEdge
    yTopOffset?: number
  }
}

interface Content {
  width: number
  height: number
}

/**
 * @param {React.RefObject} originRef - the ref for the element you'd like the menu to align with.
 * @param {React.RefObject} contentRef - used to determine the height of the content
 *  you are displaying, this is used to calculate how far above the
 *  trigger the content should be displayed when we display a menu on top
 */

export default function getPositionOnScreen(props: UsePositionProps) {
  const {originRef, contentRef, contentWidth, contentHeight} = props

  const internalAlignment = props.alignment ?? {
    xAlign: undefined,
    yAlign: undefined,
    xOriginEdgeAlign: undefined,
    yOriginEdgeAlign: undefined,
    yTopOffset: 12,
  }

  const hasFixedContentDimensions = contentWidth && contentHeight
  const canComputeContentDimensions = hasFixedContentDimensions || contentRef.current
  let hasContentDimensions = hasFixedContentDimensions
  let top = 0
  let left = 0

  if (originRef.current && canComputeContentDimensions) {
    const trigger = originRef.current.getBoundingClientRect()
    const triggerLeftMargin = parseInt(window.getComputedStyle(originRef?.current).getPropertyValue('margin-left'))
    const contentBounds = hasFixedContentDimensions
      ? {width: 0, height: 0}
      : not_typesafe_nonNullAssertion(contentRef.current).getBoundingClientRect()
    const content: Content = {width: contentWidth ?? contentBounds.width, height: contentHeight ?? contentBounds.height}

    hasContentDimensions = content.width && content.height
    internalAlignment.yAlign = getCorrectYEdge(
      internalAlignment.yOriginEdgeAlign || internalAlignment.yAlign,
      content,
      trigger,
    )
    internalAlignment.xAlign = getCorrectXEdge(
      internalAlignment.xOriginEdgeAlign || internalAlignment.xAlign,
      content,
      trigger,
    )

    switch (internalAlignment.xAlign) {
      case 'left':
        switch (internalAlignment.xOriginEdgeAlign) {
          case undefined:
          case 'left':
            left = trigger.left
            break
          case 'right':
            left = trigger.left + trigger.width - triggerLeftMargin
        }
        break
      case 'center':
        left = trigger.left + trigger.width / 2
        break
      case 'right':
        left = trigger.left - (content.width - trigger.width)
    }

    switch (internalAlignment.yAlign) {
      case 'top':
        top = trigger.top - content.height + (internalAlignment.yTopOffset ?? 12)
        break
      case 'middle':
        top = trigger.top - content.height / 2 + (internalAlignment.yTopOffset ?? 12)
        break
      case 'bottom':
        top = trigger.top + trigger.height + 4
    }
  }

  return {
    top: Math.round(top),
    left: Math.round(left),
    yAlign: internalAlignment.yAlign,
    xAlign: internalAlignment.xAlign,
    hasContentDimensions,
  }
}

/**
 * We set the alignment of the menu using the following priorities:
 *
 * 1. Always try to use the alignment that the caller has set, if any.
 * 2. If there's enough room, prefer alignment to the bottom and left edges of the originRef.
 * 3. If there isn't enough room, then flip alignment direction as necessary.
 */

function getCorrectYEdge(yAlign: YEdge | undefined, content: Content, trigger: DOMRect): YEdge {
  const distFromTop = trigger.top
  const distFromBottom = window.innerHeight - trigger.bottom
  const check: Record<YEdge, boolean> = {
    top: distFromTop > content.height,
    middle: distFromTop > content.height,
    bottom: distFromBottom > content.height,
  }

  if (yAlign !== undefined && check[yAlign]) {
    return yAlign
  }

  return check.bottom ? 'bottom' : 'top'
}

function getCorrectXEdge(xAlign: XEdge | undefined, content: Content, trigger: DOMRect): XEdge {
  const distFromRight = window.innerWidth - trigger.left
  const condition = distFromRight < content.width
  const check: Record<XEdge, boolean> = {left: !condition, center: !condition, right: condition}

  if (xAlign !== undefined && check[xAlign]) {
    return xAlign
  }

  return check.left ? 'left' : 'right'
}
