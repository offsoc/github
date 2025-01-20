import {type PropsWithChildren, createContext, useContext, useMemo} from 'react'

export const MAX_FETCH_PULL_REQUESTS_AND_BRANCHES = 50

export type GraphQLVariablesContextProps = {
  owner: string
  repo: string
  count: number
}

const GraphQLVariablesContext = createContext<GraphQLVariablesContextProps>({
  owner: '',
  repo: '',
  count: MAX_FETCH_PULL_REQUESTS_AND_BRANCHES,
})

export const ItemPickerPullRequestsAndBranchesGraphQLVariablesProvider = ({
  owner,
  repo,
  children,
}: PropsWithChildren<Omit<GraphQLVariablesContextProps, 'count'>>) => {
  const contextProps = useMemo(
    () =>
      ({
        owner,
        repo,
        count: MAX_FETCH_PULL_REQUESTS_AND_BRANCHES,
      }) satisfies GraphQLVariablesContextProps,
    [owner, repo],
  )
  return <GraphQLVariablesContext.Provider value={contextProps}>{children}</GraphQLVariablesContext.Provider>
}

export const useItemPickerPullRequestsAndBranchesGraphQLVariables = () => {
  return useContext(GraphQLVariablesContext)
}
