import {ssrSafeWindow} from '@github-ui/ssr-utils'
// eslint-disable-next-line no-restricted-imports
import {useEffect, useLayoutEffect as unsafe_useLayoutEffect} from 'react'

/**
 * Provides a safe version of `useLayoutEffect` that calls to `useEffect` on the server.
 * This is useful for components that use `useLayoutEffect` but are rendered on the server,
 * since useLayoutEffect cannot run on the server and warns in that environment
 */
export const useLayoutEffect =
  typeof ssrSafeWindow?.document?.createElement !== 'undefined' ? unsafe_useLayoutEffect : useEffect
