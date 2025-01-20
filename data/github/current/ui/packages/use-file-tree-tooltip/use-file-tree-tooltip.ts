import React from 'react'

export function useFileTreeTooltip({
  focusRowRef,
  mouseRowRef,
}: {
  focusRowRef: React.RefObject<HTMLElement>
  mouseRowRef: React.RefObject<HTMLElement>
}) {
  const [showTooltip, setShowTooltip] = React.useState(false)

  React.useEffect(() => {
    if (focusRowRef.current && mouseRowRef.current) {
      const showIfOverflowing = () => {
        const contentRef: HTMLElement | null | undefined = focusRowRef.current?.querySelector(
          '.PRIVATE_TreeView-item-content-text',
        )
        if (contentRef?.scrollWidth !== contentRef?.offsetWidth) {
          setShowTooltip(true)
        }
      }
      focusRowRef.current.onfocus = () => {
        showIfOverflowing()
      }
      focusRowRef.current.onblur = () => {
        setShowTooltip(false)
      }
      mouseRowRef.current.onmouseenter = () => {
        showIfOverflowing()
      }
      mouseRowRef.current.onmouseleave = () => {
        setShowTooltip(false)
      }
    }
  }, [focusRowRef, mouseRowRef])

  return showTooltip
}
