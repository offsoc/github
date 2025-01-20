import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import {renderHook} from '@testing-library/react'
import {useUser} from '../use-user'
import type {ReactNode} from 'react'

test('no current user', () => {
  const appPayload = {}
  const wrapper = (
    {children}: {children: ReactNode}, // Change JSX.Element to ReactNode
  ) => <AppPayloadContext.Provider value={{...appPayload}}>{children}</AppPayloadContext.Provider>

  const {result} = renderHook(() => useUser(), {wrapper})
  expect(result.current.currentUser).toBeNull()
})

test('with current user', () => {
  const appPayload = {
    current_user: {
      avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
      id: 'user_id',
      login: 'octocat',
    },
  }
  const wrapper = (
    {children}: {children: ReactNode}, // Change JSX.Element to ReactNode
  ) => <AppPayloadContext.Provider value={{...appPayload}}>{children}</AppPayloadContext.Provider>

  const {result} = renderHook(() => useUser(), {wrapper})
  expect(result.current.currentUser).not.toBeNull()
  expect(result.current.currentUser?.id).toBe('user_id')
  expect(result.current.currentUser?.login).toBe('octocat')
  expect(result.current.currentUser?.avatarUrl).toBe('https://avatars.githubusercontent.com/u/1?v=4')
})
