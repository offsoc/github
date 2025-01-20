import {noop} from '@github-ui/noop'
import type {UseMutationResult} from '@tanstack/react-query'
import {useCallback} from 'react'

type MutateAsyncCallback<TData, TVariables, TError, TContext> = (
  variables: Parameters<UseMutationResult<TData, TError, TVariables, TContext>['mutateAsync']>[0],
  options?: Parameters<UseMutationResult<TData, TError, TVariables, TContext>['mutateAsync']>[1],
) => Promise<TData | void>

export function useWrapMutationMutateAsync<TData, TError, TVariables, TContext>(
  mutation: UseMutationResult<TData, TError, TVariables, TContext>,
) {
  const mutateAsync = useCallback<MutateAsyncCallback<TData, TVariables, TError, TContext>>(
    (variables, options) => {
      return mutation.mutateAsync(variables, options).catch(noop)
    },
    [mutation],
  )

  return {mutation, mutateAsync}
}
