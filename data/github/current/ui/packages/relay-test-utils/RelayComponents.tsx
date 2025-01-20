import {useEffect} from 'react'
import type {OperationType, VariablesOf} from 'relay-runtime'
import type {PreloadedQuery, GraphQLTaggedNode} from 'react-relay'
import {useQueryLoader, useLazyLoadQuery} from 'react-relay'

type ComponentProps<TQuery extends OperationType> = {
  queryRef: PreloadedQuery<TQuery>
}

type LazyQueryProps<TQuery extends OperationType> = {
  query: GraphQLTaggedNode
  queryVariables: VariablesOf<TQuery>
  dataToComponent: (data: TQuery['response']) => JSX.Element | null
}

interface Props<TQuery extends OperationType> {
  component: ({queryRef}: ComponentProps<TQuery>, data?: TQuery) => JSX.Element | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  componentProps?: Record<string, any>
  query: GraphQLTaggedNode
  queryVariables: VariablesOf<TQuery>
  fetchPolicy?: 'store-or-network' | 'network-only'
}

export const ComponentWithPreloadedQueryRef = <TQuery extends OperationType>(props: Props<TQuery>) => {
  const [queryRef, loadQuery, disposeQuery] = useQueryLoader<TQuery>(props.query)

  useEffect(() => {
    loadQuery(props.queryVariables, {fetchPolicy: props.fetchPolicy || 'store-or-network'})
    return () => {
      disposeQuery()
    }
  }, [loadQuery, disposeQuery, props.queryVariables, props.fetchPolicy])

  return (
    <>
      {queryRef && (
        <props.component
          queryRef={queryRef as PreloadedQuery<TQuery, Record<string, unknown>>}
          {...props.componentProps}
        />
      )}
    </>
  )
}

export const ComponentWithLazyLoadQuery = <TQuery extends OperationType>(props: LazyQueryProps<TQuery>) => {
  const CommentWithRelayQuery = () => {
    const data = useLazyLoadQuery<TQuery>(props.query, props.queryVariables)

    if (data) {
      return props.dataToComponent(data)
    }

    return null
  }

  return (
    <>
      <CommentWithRelayQuery />
    </>
  )
}

export function mockRelayId(): string {
  return 'x_xxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
