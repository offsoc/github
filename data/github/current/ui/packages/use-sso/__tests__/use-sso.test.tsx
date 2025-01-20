import {AppPayloadContext} from '@github-ui/react-core/use-app-payload'
import {renderHook} from '@testing-library/react'
import {useSso} from '../use-sso'
import type {ReactNode} from 'react'

test('empty payload', () => {
  const appPayload = {}
  const wrapper = ({children}: {children: ReactNode}) => (
    <AppPayloadContext.Provider value={{...appPayload}}>{children}</AppPayloadContext.Provider>
  )

  const {result} = renderHook(() => useSso(), {wrapper})
  expect(result.current.baseAvatarUrl).toBe('https://avatars.githubusercontent.com')
  expect(result.current.ssoOrgs).toEqual([])
})

test('base avatar override', () => {
  const appPayload = {base_avatar_url: 'test'}
  const wrapper = ({children}: {children: ReactNode}) => (
    <AppPayloadContext.Provider value={{...appPayload}}>{children}</AppPayloadContext.Provider>
  )

  const {result} = renderHook(() => useSso(), {wrapper})
  expect(result.current.baseAvatarUrl).toBe('test')
})

test('with sso orgs', () => {
  const appPayload = {
    sso_organizations: [
      {login: 'test1', id: 'id1'},
      {login: 'test2', id: 'id2'},
    ],
  }
  const wrapper = ({children}: {children: ReactNode}) => (
    <AppPayloadContext.Provider value={{...appPayload}}>{children}</AppPayloadContext.Provider>
  )

  const {result} = renderHook(() => useSso(), {wrapper})
  expect(result.current.ssoOrgs).toHaveLength(2)
  expect(result.current.ssoOrgs[0]!.id).toBe('id1')
  expect(result.current.ssoOrgs[0]!.login).toBe('test1')
  expect(result.current.ssoOrgs[1]!.id).toBe('id2')
  expect(result.current.ssoOrgs[1]!.login).toBe('test2')
})
