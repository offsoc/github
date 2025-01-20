import {createContext, useContext, useMemo, useState} from 'react'

type DialogStateContextData = {
  isDialogOpen?: boolean
  setIsDialogOpen?: (isDialogOpen: boolean) => void
}

const DialogStateContext = createContext<DialogStateContextData>({})

/**
 * Simple context that tracks whether a dialog is open or not.
 * Used internally by Conversations to work around issue with having nested Overlays + Dialogs.
 */
export function DialogStateProvider({children}: {children: React.ReactNode}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const contextData = useMemo(() => ({isDialogOpen, setIsDialogOpen}), [isDialogOpen, setIsDialogOpen])

  return <DialogStateContext.Provider value={contextData}>{children}</DialogStateContext.Provider>
}

export const useDialogStateContext = () => useContext(DialogStateContext)
