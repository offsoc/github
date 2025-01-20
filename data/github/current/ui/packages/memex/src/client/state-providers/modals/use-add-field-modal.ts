import {useContext} from 'react'

import {AddFieldModalContext} from './add-field-modal-state-provider'

export const useAddFieldModal = () => {
  const context = useContext(AddFieldModalContext)
  if (!context) {
    throw new Error('useAddFieldModal must be used within a AddFieldModalContextProvider')
  }

  return context
}
