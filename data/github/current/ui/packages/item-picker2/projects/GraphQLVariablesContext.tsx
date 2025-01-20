import {type PropsWithChildren, createContext, useContext, useMemo} from 'react'

export type GraphQLVariablesContextProps = {
  owner: string
  repo: string
}

const GraphQLVariablesContext = createContext<GraphQLVariablesContextProps>({
  owner: '',
  repo: '',
})

export const ItemPickerProjectsGraphQLVariablesProvider = ({
  owner,
  repo,
  children,
}: PropsWithChildren<GraphQLVariablesContextProps>) => {
  const contextProps = useMemo(
    () =>
      ({
        owner,
        repo,
      }) satisfies GraphQLVariablesContextProps,
    [owner, repo],
  )
  return <GraphQLVariablesContext.Provider value={contextProps}>{children}</GraphQLVariablesContext.Provider>
}

export const useItemPickerProjectsGraphQLVariables = () => {
  return useContext(GraphQLVariablesContext)
}
