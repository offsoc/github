import {act, renderHook} from '@testing-library/react'
// eslint-disable-next-line no-restricted-imports
import {MemoryRouter, useNavigate} from 'react-router-dom'

import {getPathDescriptor} from '../../../client/hooks/use-view-state-reducer/get-path-descriptor'
import {useHandleUrlUpdate} from '../../../client/hooks/use-view-state-reducer/handle-url-update'
import type {CurrentView} from '../../../client/hooks/use-view-state-reducer/types'

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn().mockImplementation(actual.useNavigate),
  }
})
jest.mock('../../../client/hooks/use-view-state-reducer/get-path-descriptor')
const mockGetPathDescriptor = jest.mocked(getPathDescriptor)
const mockUseNavigate = jest.mocked(useNavigate)

describe.each([{args: {}}, {args: {replace: false}}, {args: {replace: true}}])(
  `useHandleUrlUpdate with options $args`,
  ({args}) => {
    beforeEach(() => {
      jest.resetAllMocks()
    })
    it('will not navigate when the currentView is undefined', () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockGetPathDescriptor.mockReturnValue({pathname: '/orgs/monalisa/projects/1', search: ''})
      const {result} = renderHook(() => useHandleUrlUpdate(), {wrapper: Wrapper})
      act(() => {
        result.current(undefined, args)
      })
      expect(navigate).not.toHaveBeenCalled()
    })
    it('will not navigate when outside a project route', () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockGetPathDescriptor.mockReturnValue({pathname: '/orgs/monalisa/projects/1', search: ''})
      const {result} = renderHook(() => useHandleUrlUpdate(), {
        wrapper: ({children}) => (
          <MemoryRouter initialEntries={['/orgs/monalisa/projects/1/settings']}>{children}</MemoryRouter>
        ),
      })
      act(() => {
        result.current({} as CurrentView, args)
      })
      expect(navigate).not.toHaveBeenCalled()
    })
    it('will not navigate when the path and search are the same', () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockGetPathDescriptor.mockReturnValue({pathname: '/orgs/monalisa/projects/1', search: ''})
      const {result} = renderHook(() => useHandleUrlUpdate(), {wrapper: Wrapper})
      act(() => {
        result.current({} as CurrentView, args)
      })
      expect(navigate).not.toHaveBeenCalled()
    })
    it('will navigate when the pathname only is changed', () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockGetPathDescriptor.mockReturnValue({pathname: '/orgs/monalisa/projects/1', search: ''})
      const {result} = renderHook(() => useHandleUrlUpdate(), {
        wrapper: ({children}) => (
          <MemoryRouter initialEntries={['/orgs/monalisa/projects/1/views/1']}>{children}</MemoryRouter>
        ),
      })
      act(() => {
        result.current({} as CurrentView, args)
      })
      expect(navigate).toHaveBeenNthCalledWith(
        1,
        {pathname: '/orgs/monalisa/projects/1', search: ''},
        {...args, state: {skipTurbo: true}},
      )
    })
    it('will navigate when the search only is changed', () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockGetPathDescriptor.mockReturnValue({pathname: '/orgs/monalisa/projects/1', search: 'new=search'})
      const {result} = renderHook(() => useHandleUrlUpdate(), {
        wrapper: ({children}) => <MemoryRouter initialEntries={['/orgs/monalisa/projects/1']}>{children}</MemoryRouter>,
      })
      act(() => {
        result.current({} as CurrentView, args)
      })
      expect(navigate).toHaveBeenNthCalledWith(
        1,
        {pathname: '/orgs/monalisa/projects/1', search: 'new=search'},
        {...args, state: {skipTurbo: true}},
      )
    })
    it('will navigate when the pathname and search are changed', () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockGetPathDescriptor.mockReturnValue({pathname: '/orgs/monalisa/projects/1', search: 'new=search'})
      const {result} = renderHook(() => useHandleUrlUpdate(), {
        wrapper: ({children}) => (
          <MemoryRouter initialEntries={['/orgs/monalisa/projects/1/views/1']}>{children}</MemoryRouter>
        ),
      })
      act(() => {
        result.current({} as CurrentView, args)
      })
      expect(navigate).toHaveBeenNthCalledWith(
        1,
        {pathname: '/orgs/monalisa/projects/1', search: 'new=search'},
        {...args, state: {skipTurbo: true}},
      )
    })
    it('will not navigate when the old search differs only by the leading ?', () => {
      const navigate = jest.fn()
      mockUseNavigate.mockReturnValue(navigate)
      mockGetPathDescriptor.mockReturnValue({pathname: '/orgs/monalisa/projects/1', search: 'new=search'})
      const {result} = renderHook(() => useHandleUrlUpdate(), {
        wrapper: ({children}: {children: React.ReactNode}) => {
          return <MemoryRouter initialEntries={['/orgs/monalisa/projects/1?new=search']}>{children}</MemoryRouter>
        },
      })
      act(() => {
        result.current({} as CurrentView, args)
      })
      expect(navigate).not.toHaveBeenCalled()
    })
  },
)

function Wrapper({children}: {children: React.ReactNode}) {
  return <MemoryRouter initialEntries={['/orgs/monalisa/projects/1']}>{children}</MemoryRouter>
}
