import {act} from '@testing-library/react'

// https://github.com/tc39/proposal-promise-with-resolvers
export function withResolvers<R>() {
  let resolve: (value: R) => unknown
  let reject: (value?: unknown) => unknown
  const promise = new Promise<R>((res, rej) => {
    resolve = res
    reject = rej
  })

  // @ts-expect-error those are set sync by the time we get here
  return {resolve, reject, promise}
}

export async function nextTick() {
  return act(
    () =>
      new Promise(resolve => {
        setTimeout(resolve, 1)
      }),
  )
}
