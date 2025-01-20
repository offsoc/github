import {DndContext, type DndContextProps, useDraggable} from '@github-ui/drag-and-drop'
import {testIdProps} from '@github-ui/test-id-props'
import {Box} from '@primer/react'
import {useState} from 'react'

import useBodyClass from '../../hooks/use-body-class'
import {SLICER_PANEL_DEFAULT_WIDTH, SLICER_PANEL_MAX_WIDTH, SLICER_PANEL_MIN_WIDTH} from './constants'

type SlicerPanelResizerControlProps = {
  /** The current width of the panel */
  width: number
  /** Event handler for reset size event, called when the resizer control is double clicked */
  onResetSize: () => void
}

const SlicerPanelResizerSash = ({width, onResetSize}: SlicerPanelResizerControlProps) => {
  const sashId = 'slicer-panel-resizer-sash'
  const {attributes, listeners, setNodeRef, isDragging} = useDraggable({
    id: sashId,
    attributes: {
      role: 'separator',
    },
  })

  useBodyClass('is-resizing-slicer-panel', isDragging)

  return (
    // eslint-disable-next-line github/a11y-role-supports-aria-props
    <Box
      ref={setNodeRef}
      sx={{
        bg: isDragging ? 'accent.fg' : 'border.default',
        cursor: 'col-resize',
        position: 'relative',
        transitionDelay: '0.1s',
        width: '1px',
        outline: 'none', // This is to remove focus outline when dragCancel is triggered
      }}
      aria-valuenow={width}
      aria-valuemin={SLICER_PANEL_MIN_WIDTH}
      aria-valuemax={SLICER_PANEL_MAX_WIDTH}
      aria-orientation="vertical"
      id={sashId}
      {...attributes}
      {...testIdProps('slicer-panel-resizer-sash')}
    >
      <Box
        sx={{
          cursor: 'col-resize',
          inset: '0 -3px',
          position: 'absolute',
          height: '100%',
        }}
        {...listeners}
        onDoubleClick={onResetSize}
      />
    </Box>
  )
}

type SlicerPanelResizerProps = {
  /** Handler for resize event, called while resize handle is dragging, used to update width of panel locally */
  onResize: (width: number) => void
  /** Handler for resize end event, called when dragging has stopped, been cancelled, or when size is reset,
   * called with final width and used for updating the server state
   */
  onResizeEnd: (width: number) => void
  /** The current width of the slicer panel */
  width: number
}

export const SlicerPanelResizer = ({onResize, onResizeEnd, width}: SlicerPanelResizerProps) => {
  const [originalWidth, setOriginalWidth] = useState(width)

  const handleDragStart = () => {
    setOriginalWidth(width)
  }

  // DndKit defaults to PointerEvent(s), however, there is no good way to narrow this further
  const handleDragMove: DndContextProps['onDragMove'] = ({delta, active}) => {
    const initialActiveRect = active.rect.current.initial
    if (!initialActiveRect) return

    const initialLeft = Math.floor(initialActiveRect.left + initialActiveRect.width / 2 ?? 0)
    let newWidth = initialLeft + delta.x

    if (newWidth > SLICER_PANEL_MAX_WIDTH) {
      newWidth = SLICER_PANEL_MAX_WIDTH
    }

    if (newWidth < SLICER_PANEL_MIN_WIDTH) {
      newWidth = SLICER_PANEL_MIN_WIDTH
    }

    onResize(Math.round(newWidth))
  }

  const handleDragEnd = () => {
    handleResizeEnd(width)
  }

  const handleDragCancel = () => {
    onResize(originalWidth)
  }

  const handleResetSize = () => {
    handleResizeEnd(SLICER_PANEL_DEFAULT_WIDTH)
  }

  const handleResizeEnd = (newWidth: number) => {
    // If the width hasn't changed, don't call the onResizeEnd callback, this is to prevent
    // unnecessary calls to the server when the user is just clicking/double-clicking on the resizer sash
    if (newWidth === originalWidth) return
    onResizeEnd(newWidth)
  }

  return (
    <DndContext
      autoScroll={false}
      onDragCancel={handleDragCancel}
      onDragEnd={handleDragEnd}
      onDragMove={handleDragMove}
      onDragStart={handleDragStart}
    >
      <SlicerPanelResizerSash onResetSize={handleResetSize} width={width} />
    </DndContext>
  )
}
