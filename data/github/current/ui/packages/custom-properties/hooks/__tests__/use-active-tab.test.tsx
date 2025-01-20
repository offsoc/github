import {Wrapper} from '@github-ui/react-core/test-utils'
import {renderHook} from '@testing-library/react'
import type {ComponentProps, PropsWithChildren} from 'react'
import {Route, Routes} from 'react-router-dom'

import {definitionsRoute} from '../../custom-properties'
import {useActiveTab} from '../use-active-tab'

test('returns correct initial tab', async () => {
  const {result} = renderHook(useActiveTab, {
    wrapper: ({children}) => <HookWrapper>{children}</HookWrapper>,
    initialProps: 'all',
  })

  const [tab] = result.current
  expect(tab).toEqual('properties')
})

test('returns correct initial tab from a url', async () => {
  const {result} = renderHook(useActiveTab, {
    wrapper: ({children}) => <HookWrapper search="?tab=set-values">{children}</HookWrapper>,
    initialProps: 'all',
  })

  const [tab] = result.current
  expect(tab).toEqual('set-values')
})

test('falls back to "properties" if tab value is invalid', async () => {
  const {result} = renderHook(useActiveTab, {
    wrapper: ({children}) => <HookWrapper search="?tab=unknown">{children}</HookWrapper>,
    initialProps: 'all',
  })

  const [tab] = result.current
  expect(tab).toEqual('properties')
})

test('ignores parameter if permissions are "definitions"', async () => {
  const {result} = renderHook(useActiveTab, {
    wrapper: ({children}) => <HookWrapper search="?tab=set-values">{children}</HookWrapper>,
    initialProps: 'definitions',
  })

  const [tab] = result.current
  expect(tab).toEqual('properties')
})

test('ignores parameter if permissions are "values"', async () => {
  const {result} = renderHook(useActiveTab, {
    wrapper: ({children}) => <HookWrapper search="?tab=properties">{children}</HookWrapper>,
    initialProps: 'values',
  })

  const [tab] = result.current
  expect(tab).toEqual('set-values')
})

test('builds correct href preserving existing params', async () => {
  const {result} = renderHook(useActiveTab, {
    wrapper: ({children}) => <HookWrapper search="?another=test">{children}</HookWrapper>,
    initialProps: 'all',
  })

  const [tab, builder] = result.current
  expect(tab).toEqual('properties')
  expect(builder('set-values')).toEqual('/organizations/github/settings/custom-properties?another=test&tab=set-values')
})

function HookWrapper({children, ...props}: PropsWithChildren<ComponentProps<typeof Wrapper>>) {
  return (
    <Wrapper pathname="/organizations/github/settings/custom-properties" routes={[definitionsRoute]} {...props}>
      <Routes>
        {[definitionsRoute].map(route => (
          <Route key={route.path} path={route.path} element={children} />
        ))}
      </Routes>
    </Wrapper>
  )
}
