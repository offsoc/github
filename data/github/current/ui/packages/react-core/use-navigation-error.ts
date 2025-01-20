import type {PageError} from './app-routing-types'
import {useContext} from 'react'
import {NavigationErrorContext} from './AppRouter'

export function useNavigationError(): PageError | null {
  return useContext(NavigationErrorContext)
}
