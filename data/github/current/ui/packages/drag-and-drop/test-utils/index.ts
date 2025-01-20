import {fireEvent} from '@storybook/test'

/**
 * Simulate mouse drag and drop events in a storybook environment.
 */

// https://stackoverflow.com/a/53946549/1179377
function isElement(obj: unknown): obj is Element {
  if (typeof obj !== 'object') {
    return false
  }
  let prototypeStr
  let prototype
  do {
    prototype = Object.getPrototypeOf(obj)
    // to work in iframe
    prototypeStr = Object.prototype.toString.call(prototype)
    // '[object Document]' is used to detect document
    if (prototypeStr === '[object Element]' || prototypeStr === '[object Document]') {
      return true
    }
    obj = prototype
    // null is the terminal of object
  } while (prototype !== null)
  return false
}

function getElementClientCenter(element: Element) {
  const {left, top, width, height} = element.getBoundingClientRect()
  return {
    x: left + width / 2,
    y: top + height / 2,
  }
}

const getCoords = (element?: Element) => (isElement(element) ? getElementClientCenter(element) : element)

const sleep = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

export async function dragEnd(element: Element, current: {clientX: number; clientY: number}): Promise<void> {
  await fireEvent.mouseUp(element, current)
}

export async function dragMove(
  element: Element,
  current: {clientX: number; clientY: number},
  step: {x: number; y: number},
  steps = 20,
  duration = 500,
): Promise<{clientX: number; clientY: number}> {
  for (let i = 0; i < steps; i++) {
    current.clientX += step.x
    current.clientY += step.y
    await sleep(duration / steps)
    await fireEvent.mouseMove(element, current)
  }
  return current
}

type DragStartParams = {
  element: Element
  delta?: {
    x: number
    y: number
  }
  to?: Element
  steps?: number
  duration?: number
}

export async function dragStart({
  element,
  to: inTo,
  delta,
  steps = 20,
}: DragStartParams): Promise<{currentPosition: {clientX: number; clientY: number}; mouseStep: {x: number; y: number}}> {
  const from = getElementClientCenter(element)
  const to = (
    delta
      ? {
          x: from.x + delta.x,
          y: from.y + delta.y,
        }
      : getCoords(inTo)
  ) as {x: number; y: number}

  const mouseStep = {
    x: (to.x - from.x) / steps,
    y: (to.y - from.y) / steps,
  }

  const currentPosition = {
    clientX: from.x,
    clientY: from.y,
  }

  await fireEvent.mouseEnter(element, currentPosition)
  await fireEvent.mouseOver(element, currentPosition)
  await fireEvent.mouseMove(element, currentPosition)
  await fireEvent.mouseDown(element, currentPosition)

  // Slight bump to trigger 'drag' state
  await fireEvent.mouseMove(element, {clientX: 0, clientY: 1})

  return {currentPosition, mouseStep}
}
