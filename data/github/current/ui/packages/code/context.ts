import React from 'react'

export const fileContext = React.createContext<{fileUrl: string; repoUrl: string} | null>(null)

export function useFileContext() {
  const value = React.useContext(fileContext)
  if (value == null) throw new Error('useFileContext must be used within a <FileFrame />')
  return value
}
