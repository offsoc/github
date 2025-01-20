import throttle from 'lodash-es/throttle'
import {useCallback, useEffect, useMemo, useRef} from 'react'

type Buffer = {x: [number, number]; y: [number, number]}

/**
 * Options for configuring the auto-scroll behavior
 */
type Opts = {
  /**
   * Whether scrolling should be active (for example, whether the user is
   * currently dragging something)
   */
  active: boolean

  /**
   * An axis to lock scrolling to
   */
  axis?: 'x' | 'y'

  /**
   * A ref pointing to the scrollable container
   */
  scrollRef?: React.RefObject<HTMLElement>

  /**
   * A coefficient used to dictate how many pixels the container should
   * scroll by on each animation tick. This is also the maximum value.
   */
  strength: number

  /**
   * The size of the buffer within which we will auto-scroll the container,
   * along the X axis from the left and right.
   *
   * If not defined, the buffer be calculated from the width of the scroll
   * container.
   */
  bufferX?: [number, number]

  /**
   * The size of the buffer within which we will auto-scroll the container,
   * along the Y axis from the top and bottom.
   *
   * If not defined, the buffer be calculated from the height of the scroll
   * container.
   */
  bufferY?: [number, number]

  /**
   * When calculating X buffers automatically, this percentage of the container
   * width should be retained as a non-scrolling "dead zone".
   *
   * This value should be a number between 0 and 1.
   */
  deadZoneRatioX?: number

  /**
   * When calculating Y buffers automatically, this percentage of the container
   * height should be retained as a non-scrolling "dead zone".
   *
   * This value should be a number between 0 and 1.
   */
  deadZoneRatioY?: number

  /**
   * A function used to ease the curve of scroll rate relative to position
   * within the buffer.
   *
   * This should be a memoized/constant value to avoid rebinding handlers too
   * often.
   */
  ease?: (v: number) => number

  /**
   * The minimum distance the cursor needs to move on the X axis
   * before triggering auto-scrolling
   */
  mouseMoveThresholdX?: number

  /**
   * The minimum distance the cursor needs to move on the Y axis
   * before triggering auto-scrolling
   */
  mouseMoveThresholdY?: number

  /**
   * The maximum size of the buffer on the X axis.
   * Used when auto-calculating the X buffer.
   */
  maxBufferX?: number

  /**
   * The maximum size of the buffer on the Y axis.
   * Used when auto-calculating the Y buffer.
   */
  maxBufferY?: number
}

const MAIN_MOUSE_BUTTON = 0

/**
 * Automatically scroll a container when the mouse pointer enters a buffer at
 * the edge of the container.
 *
 * While auto-scroll is active, this monitors the position of the mouse
 * whenever it moves within the scrolling container. If the mouse enters a
 * buffer at any edge of the container whose size is defined by `opts.buffer`,
 * scroll the container.
 *
 * The rate at which the container scrolls is a function of how far into the
 * buffer the pointer is, the `opts.strength` multiplier (which also serves as
 * the max pixels-per-frame scroll rate), the `opts.ease` function.
 *
 * From an event perspective, when the user begins move the mouse while
 * `opts.active` is true, we calculate scroll velocity based on mouse position
 * relative to the scrollable containers and the user-defined buffer, and kick
 * off a loop of frames, within each of which we scroll until either the use
 * releases the user releases the mouse button or the user moves the pointer to
 * a position not within any of our defined scroll buffers.
 *
 * @param opts Configuration for the auto-scroll behavior
 */
export default function useAutoScroll(opts: Opts) {
  const animationFrame = useRef<number | null>(null)
  const yScrollBase = useRef<number | null>(null)
  const xScrollBase = useRef<number | null>(null)
  const bufferRef = useRef<Buffer>({
    x: opts.bufferX ?? [0, 0],
    y: opts.bufferY ?? [0, 0],
  })
  const lockedToX = opts.axis === 'x'
  const lockedToY = opts.axis === 'y'
  const mouseOrigin = useRef<{x: number; y: number} | null>(null)
  const maxBufferX = opts.maxBufferX ?? 300
  const maxBufferY = opts.maxBufferY ?? 200
  const deadZoneRatioX = opts.deadZoneRatioX ?? 0.1
  const deadZoneRatioY = opts.deadZoneRatioY ?? 0.1

  /**
   * Since this callback is throttled inline, eslint
   * can't properly detect dependencies, so we useMemo
   * returning a function instead
   */
  const updateBufferRef = useMemo(
    () =>
      throttle(() => {
        const el = opts.scrollRef?.current
        if (!el) return
        const rect = el.getBoundingClientRect()

        // When no user-provided buffer is provided, the buffer on each dimension
        // is 1/2 the size of the container minus a central dead zone of 10% of
        // that dimension. This ensures that the central 10% of the container is a
        // "dead zone" that does not trigger scrolling.

        const defaultBufferX = Math.min(rect.width / 2 - (rect.width * deadZoneRatioX) / 2, maxBufferX)
        const defaultBufferY = Math.min(rect.height / 2 - (rect.height * deadZoneRatioY) / 2, maxBufferY)

        bufferRef.current = {
          x: opts.bufferX ?? [defaultBufferX, defaultBufferX],
          y: opts.bufferY ?? [defaultBufferY, defaultBufferY],
        }
      }, 50),
    [opts.scrollRef, opts.bufferX, opts.bufferY, deadZoneRatioX, maxBufferX, deadZoneRatioY, maxBufferY],
  )

  // If the user didn't provide a buffer, set the initial buffer size, and
  // update the buffer ref when the window resizes in case it changes.
  useEffect(() => {
    if (opts.bufferX === undefined || opts.bufferY === undefined) {
      updateBufferRef()
      addEventListener('resize', updateBufferRef)
    }

    return () => {
      removeEventListener('resize', updateBufferRef)
    }
  }, [opts.bufferX, opts.bufferY, updateBufferRef])

  // Update the buffer ref when the initially passed buffer changes
  useEffect(() => {
    if (opts.bufferX !== undefined || opts.bufferY !== undefined) {
      bufferRef.current = {
        x: opts.bufferX ?? [0, 0],
        y: opts.bufferY ?? [0, 0],
      }
    }
  }, [opts.bufferX, opts.bufferY])

  const reset = useCallback(() => {
    if (animationFrame.current) cancelAnimationFrame(animationFrame.current)
    animationFrame.current = null
    yScrollBase.current = null
    xScrollBase.current = null
  }, [])

  // A single scroll frame: Adjust the scroll position of the element, and
  // then schedule another frame.
  const tick = useCallback(() => {
    const el = opts.scrollRef?.current

    if (!el) {
      return
    }

    if (yScrollBase.current && !lockedToX) {
      el.scrollTop += yScrollBase.current * opts.strength
    }

    if (xScrollBase.current && !lockedToY) {
      el.scrollLeft += xScrollBase.current * opts.strength
    }

    animationFrame.current = requestAnimationFrame(tick)
  }, [lockedToX, lockedToY, opts.scrollRef, opts.strength])

  const onMouseUp = useCallback(
    (e: MouseEvent) => {
      if (animationFrame.current && e.button === MAIN_MOUSE_BUTTON) {
        reset()
        mouseOrigin.current = null
      }
    },
    [reset],
  )

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button === MAIN_MOUSE_BUTTON) {
        mouseOrigin.current = {x: e.clientX, y: e.clientY}
      }
    },
    [mouseOrigin],
  )

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      const container = opts.scrollRef?.current
      const mouseMoveThresholdX = opts?.mouseMoveThresholdX ?? 15
      const mouseMoveThresholdY = opts?.mouseMoveThresholdY ?? 15

      if (!opts.active || !container || !mouseOrigin.current) {
        reset()
        return
      }

      const containerRect = container.getBoundingClientRect()

      xScrollBase.current = getBaseVelocity({
        mousePos: e.clientX,
        containerStart: containerRect.left,
        containerEnd: containerRect.right,
        ease: opts.ease,
        buffer: bufferRef.current.x,
        mouseOrigin: mouseOrigin.current.x,
        mouseMoveThreshold: mouseMoveThresholdX,
      })

      yScrollBase.current = getBaseVelocity({
        mousePos: e.clientY,
        containerStart: containerRect.top,
        containerEnd: containerRect.bottom,
        ease: opts.ease,
        buffer: bufferRef.current.y,
        mouseOrigin: mouseOrigin.current.y,
        mouseMoveThreshold: mouseMoveThresholdY,
      })

      if (yScrollBase.current == null && xScrollBase.current == null) {
        reset()
      }

      // Kick off our scrolling animation loop if it's not already in
      // progress (otherwise, we allow the current loop to continue using
      // the adjusted parameters in our base scroll refs.)
      if (!animationFrame.current) {
        tick()
      }
    },
    [opts.active, opts.ease, opts.scrollRef, reset, tick, opts.mouseMoveThresholdX, opts.mouseMoveThresholdY],
  )

  useEffect(() => {
    addEventListener('mousemove', onMouseMove)
    addEventListener('mouseup', onMouseUp)
    addEventListener('mousedown', onMouseDown)

    return () => {
      removeEventListener('mousemove', onMouseMove)
      removeEventListener('mouseup', onMouseUp)
      removeEventListener('mousedown', onMouseDown)
    }
  }, [onMouseMove, onMouseUp, onMouseDown])
}

/**
 * Given a mouse position along some axis, the start and end positions of a
 * container, and a buffer within which to scroll, calculate the velocity with
 * which we should scroll based on how far into that buffer the mouse position
 * is, then apply an easing function.
 */
function getBaseVelocity({
  mousePos,
  containerStart,
  containerEnd,
  ease,
  buffer,
  mouseOrigin,
  mouseMoveThreshold,
}: {
  mousePos: number
  containerStart: number
  containerEnd: number
  ease: Opts['ease']
  buffer: [number, number]
  mouseOrigin: number
  mouseMoveThreshold: number
}): number | null {
  const bufferStart = Array.isArray(buffer) ? buffer[0] : buffer
  const bufferEnd = Array.isArray(buffer) ? buffer[1] : buffer
  const startBound = containerStart + bufferStart
  const endBound = containerEnd - bufferEnd

  // If the mouse hasn't moved the minimum distance, then do nothing.
  // This prevents aggressively scrolling when a card is grabbed within the buffer.
  if (Math.abs(mousePos - mouseOrigin) < mouseMoveThreshold) {
    return null
  }

  if (mousePos < startBound && mousePos < mouseOrigin) {
    // If the mouse position is to the left of the start buffer's end and
    // moving in the correct direction, find out by how far and apply easing.
    // Math.max to ensure we cap velocity at 100% of the buffer.
    const distanceIntoBuffer = startBound - Math.max(mousePos - mouseMoveThreshold, containerStart)
    return applyEasing(-(distanceIntoBuffer / bufferStart), ease)
  } else if (mousePos > endBound && mousePos > mouseOrigin) {
    // If the mouse position is to the right of the end buffer's start and
    // moving in the correct direction, find out by how far and apply easing.
    // Math.min to ensure we cap velocity at 100% of the buffer.
    const distanceIntoBuffer = Math.min(mousePos - mouseMoveThreshold, containerEnd) - endBound
    return applyEasing(distanceIntoBuffer / bufferEnd, ease)
  }

  return null
}

function applyEasing(val: number, easing: Opts['ease']) {
  if (!easing) {
    return val
  }

  // The user-supplied easing function need not concern itself with whether
  // val is positive or negative, just the absolute velocity. We do the
  // conversion here to save users the trouble.
  return val < 0 ? -easing(-val) : easing(val)
}
