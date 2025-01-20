import {createContext, type SetStateAction, useContext, useMemo, useState} from 'react'

import type {CreatedWithTemplateMemex} from '../../api/created-with-template-memex/api'
import {getInitialState} from '../../helpers/initial-state'

type CreatedWithTemplateMemexType = {
  /** Memex associated with the template used for the current project. Will be undefined unless an organization template was used. */
  createdWithTemplateMemex?: CreatedWithTemplateMemex
  /** Update created with template memex. Invoked when project data is updated during a live refresh. */
  setCreatedWithTemplateMemex: React.Dispatch<SetStateAction<CreatedWithTemplateMemex | undefined>>
}

const CreatedWithTemplateMemexContext = createContext<CreatedWithTemplateMemexType | null>(null)

/**
 * A context provider to track state of the memex associated with the template
 * used to create the current project.
 */
export const CreatedWithTemplateMemexProvider: React.FC<{children: React.ReactNode}> = props => {
  const {createdWithTemplateMemex: initialCreatedWithTemplateMemex} = getInitialState()
  const [createdWithTemplateMemex, setCreatedWithTemplateMemex] = useState<CreatedWithTemplateMemex | undefined>(
    initialCreatedWithTemplateMemex,
  )

  const contextValue = useMemo(
    () => ({createdWithTemplateMemex, setCreatedWithTemplateMemex}),
    [createdWithTemplateMemex, setCreatedWithTemplateMemex],
  )

  return (
    <CreatedWithTemplateMemexContext.Provider value={contextValue}>
      {props.children}
    </CreatedWithTemplateMemexContext.Provider>
  )
}

export const useCreatedWithTemplateMemex = (): CreatedWithTemplateMemexType => {
  const contextValue = useContext(CreatedWithTemplateMemexContext)
  if (!contextValue) {
    throw Error(`useCreatedWithTemplateMemex can only be accessed from a CreatedWithTemplateMemexProvider component`)
  }

  return contextValue
}
