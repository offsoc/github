import {createContext, memo, type SetStateAction, useMemo, useState} from 'react'

import {getInitialState} from '../../helpers/initial-state'

type TemplateDialogContextType = {
  isTemplatesDialogOpen: boolean
  setIsTemplatesDialogOpen: React.Dispatch<SetStateAction<boolean>>
  showTemplateDialog: boolean
}

export const TemplateDialogContext = createContext<TemplateDialogContextType | null | undefined>(null)

export const TemplateDialogStateProvider = memo(function TemplateDialogStateProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState<boolean>(true)
  const {showTemplateDialog} = getInitialState()

  const contextValue = useMemo<TemplateDialogContextType>(
    () => ({
      showTemplateDialog,
      isTemplatesDialogOpen,
      setIsTemplatesDialogOpen,
    }),
    [showTemplateDialog, isTemplatesDialogOpen],
  )

  return <TemplateDialogContext.Provider value={contextValue}>{children}</TemplateDialogContext.Provider>
})
