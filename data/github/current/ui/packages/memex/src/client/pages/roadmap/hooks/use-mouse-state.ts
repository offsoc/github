import {type MouseEventHandler, useCallback, useMemo, useState} from 'react'

import {useThrottle} from '../../../hooks/common/timeouts/use-throttle'

export type MouseState = {
  isHovered: boolean
  mouseX: number | null
  mouseY: number | null
  buttonPressedOnEntry: boolean
}

export const useMouseState = () => {
  const [mouseState, setMouseState] = useState<MouseState>({
    isHovered: false,
    mouseX: null,
    mouseY: null,
    buttonPressedOnEntry: false,
  })
  const onMouseEnter: MouseEventHandler = useCallback(
    event => setMouseState(mouse => ({...mouse, isHovered: true, buttonPressedOnEntry: !!event.buttons})),
    [],
  )
  const onMouseMove: MouseEventHandler = useThrottle(event => {
    setMouseState(mouse => ({...mouse, mouseX: event.clientX, mouseY: event.clientY}))
  }, 16)
  const onMouseLeave = useCallback(
    () => setMouseState(mouse => ({...mouse, isHovered: false, buttonPressedOnEntry: false})),
    [],
  )

  return useMemo(
    () => ({mouseState, onMouseEnter, onMouseMove, onMouseLeave}),
    [mouseState, onMouseEnter, onMouseMove, onMouseLeave],
  )
}
