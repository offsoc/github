import {ActionMenu, type AnchoredOverlayProps, Box, type OverlayProps, registerPortalRoot} from '@primer/react'
import {useEffect, useRef, useState} from 'react'

export const COPILOT_CHAT_MENU_PORTAL_ROOT = 'copilotChatMenuPortalRoot'
export const COPILOT_CHAT_MESSAGES_MENU_PORTAL_ROOT = 'copilotChatMessagesMenuPortalRoot'
export const COPILOT_CHAT_PORTAL_ROOT = 'copilotChatPortalRoot'

export const ChatPortalContainer = () => {
  const chatMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    registerPortalRoot(chatMenuRef.current!, COPILOT_CHAT_PORTAL_ROOT)
  }, [])

  return <Box ref={chatMenuRef} sx={{position: 'absolute', top: 0, right: 0, zIndex: 100}} />
}

export const MenuPortalContainer = () => {
  const chatMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    registerPortalRoot(chatMenuRef.current!, COPILOT_CHAT_MENU_PORTAL_ROOT)
  }, [])

  return <Box ref={chatMenuRef} sx={{position: 'absolute', top: 0, right: 0}} />
}

export const MessagesPortalContainer = () => {
  const chatMenuRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    registerPortalRoot(chatMenuRef.current!, COPILOT_CHAT_MESSAGES_MENU_PORTAL_ROOT)
  }, [])

  return <div ref={chatMenuRef} />
}

export type MenuOverlayProps = Partial<OverlayProps> &
  Pick<AnchoredOverlayProps, 'align'> & {
    children: React.ReactNode
  }

export const ActionMenuOverlay = ({children, portalContainerName, ...overlayProps}: MenuOverlayProps) => {
  const [mounted, setMounted] = useState(() => typeof document !== 'undefined')
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <ActionMenu.Overlay {...overlayProps} portalContainerName={portalContainerName || COPILOT_CHAT_MENU_PORTAL_ROOT}>
      {children}
    </ActionMenu.Overlay>
  )
}
