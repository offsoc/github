import {useState, useRef, useEffect, useCallback} from 'react'

export const useConfirmationMessage = () => {
  const [changesSaved, setChangesSaved] = useState<boolean>(false)

  const saveConfirmationRef = useRef<HTMLDivElement>(null)

  const showConfirmationMessage = useCallback((toShow: boolean) => {
    setChangesSaved(prev => {
      if (prev && toShow) {
        // Focus on the confirmation message again when no edits are made and save is clicked
        saveConfirmationRef.current?.focus()
      }
      return toShow
    })
  }, [])

  useEffect(() => {
    if (changesSaved) {
      saveConfirmationRef.current?.focus()
    }
  }, [changesSaved])

  return {saveConfirmationRef, changesSaved, showConfirmationMessage}
}
