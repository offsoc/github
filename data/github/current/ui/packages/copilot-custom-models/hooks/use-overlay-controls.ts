import {useCallback, useState} from 'react'

interface UseOverlayControls {
  close: () => void
  isOpen: boolean
  open: () => void
}

export function useOverlayControls(): UseOverlayControls {
  const [isOpen, setIsOpen] = useState(false)
  const close = useCallback(() => setIsOpen(false), [])
  const open = useCallback(() => setIsOpen(true), [])

  return {close, isOpen, open}
}
