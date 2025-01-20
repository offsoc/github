import {createContext, memo, type SetStateAction, useMemo, useState} from 'react'

type AddFieldModalContextType = {
  setShowAddFieldModal: React.Dispatch<SetStateAction<boolean>>
  showAddFieldModal: boolean
}

export const AddFieldModalContext = createContext<AddFieldModalContextType | null>(null)

export const AddFieldModalContextProvider = memo(function AddFieldModalContextProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [showAddFieldModal, setShowAddFieldModal] = useState(false)

  const contextValue = useMemo<AddFieldModalContextType>(
    () => ({
      showAddFieldModal,
      setShowAddFieldModal,
    }),
    [showAddFieldModal],
  )

  return <AddFieldModalContext.Provider value={contextValue}>{children}</AddFieldModalContext.Provider>
})
