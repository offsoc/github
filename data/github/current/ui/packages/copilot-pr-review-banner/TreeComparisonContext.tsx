import {
  type PropsWithChildren,
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import {
  TREE_COMPARISON_REFERENCE_TYPE,
  type TreeComparisonReference,
} from '@github-ui/copilot-chat/utils/copilot-chat-types'

interface TreeComparisonContextProps extends PropsWithChildren {
  treeComparison: TreeComparisonReference | undefined
  setTreeComparison: Dispatch<SetStateAction<Omit<TreeComparisonReference, 'type' | 'diffHunks'>>>
}

const TreeComparisonContext = createContext<TreeComparisonContextProps | undefined>(undefined)

interface TreeComparisonProps {
  baseRepoId?: TreeComparisonReference['baseRepoId'] | undefined
  headRepoId?: TreeComparisonReference['headRepoId'] | undefined
  baseRevision?: TreeComparisonReference['baseRevision'] | undefined | null
  headRevision?: TreeComparisonReference['headRevision'] | undefined | null
}

export interface TreeComparisonProviderProps extends PropsWithChildren<TreeComparisonProps> {}

const defaultRepoId = 0
const defaultRevision = ''

export const TreeComparisonProvider = ({children, ...props}: TreeComparisonProviderProps) => {
  const [treeComparison, setTreeComparison] = useState<Omit<TreeComparisonReference, 'type' | 'diffHunks'>>({
    baseRepoId: props.baseRepoId ?? defaultRepoId,
    baseRevision: props.baseRevision ?? defaultRevision,
    headRepoId: props.headRepoId ?? defaultRepoId,
    headRevision: props.headRevision ?? defaultRevision,
  })

  const {baseRepoId, headRepoId, baseRevision, headRevision} = treeComparison
  const providerData = useMemo(
    () =>
      ({
        setTreeComparison,
        treeComparison: haveTreeComparison({baseRepoId, baseRevision, headRepoId, headRevision})
          ? {type: TREE_COMPARISON_REFERENCE_TYPE, baseRevision, headRevision, baseRepoId, headRepoId, diffHunks: []}
          : undefined,
      }) satisfies TreeComparisonContextProps,
    [baseRepoId, baseRevision, headRepoId, headRevision],
  )
  return <TreeComparisonContext.Provider value={providerData}>{children}</TreeComparisonContext.Provider>
}

export const useTreeComparison = () => {
  const context = useContext(TreeComparisonContext)
  if (!context) throw new Error('useTreeComparison must be used with TreeComparisonProvider.')
  return context
}

export const haveTreeComparison = ({baseRepoId, baseRevision, headRepoId, headRevision}: TreeComparisonProps) => {
  if (baseRepoId === undefined || baseRepoId === defaultRepoId) return false
  if (headRepoId === undefined || headRepoId === defaultRepoId) return false
  if (baseRevision === undefined || baseRevision === defaultRevision) return false
  return headRevision !== undefined && headRevision !== defaultRevision
}
