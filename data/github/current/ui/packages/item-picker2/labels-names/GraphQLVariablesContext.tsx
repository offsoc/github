import {type PropsWithChildren, createContext, useContext, useMemo} from 'react'

export const MAX_FETCH_LABELS = 50

export type GraphQLVariablesContextProps = {
  owner: string
  repo: string
  count: number
  withDate: boolean
  withPath: boolean
}

const GraphQLVariablesContext = createContext<GraphQLVariablesContextProps>({
  owner: '',
  repo: '',
  count: MAX_FETCH_LABELS,
  withDate: false,
  withPath: false,
})

export const ItemPickerLabelsGraphQLVariablesProvider = ({
  owner,
  repo,
  withDate,
  withPath,
  children,
}: PropsWithChildren<Omit<GraphQLVariablesContextProps, 'count'>>) => {
  const contextProps = useMemo(
    () =>
      ({
        owner,
        repo,
        count: MAX_FETCH_LABELS,
        withDate,
        withPath,
      }) satisfies GraphQLVariablesContextProps,
    [owner, repo, withDate, withPath],
  )
  return <GraphQLVariablesContext.Provider value={contextProps}>{children}</GraphQLVariablesContext.Provider>
}

export const useItemPickerLabelsGraphQLVariables = () => {
  return useContext(GraphQLVariablesContext)
}
