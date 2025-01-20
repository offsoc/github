import {renderHook} from '@testing-library/react'

import {defaultTitleHeaderTag} from '../../constants'
import {useNextHeaderTag} from '../use-next-header-tag'

const useNestedListViewTitleMock = jest.fn().mockReturnValue({
  titleHeaderTag: defaultTitleHeaderTag,
  hasMetadataTitle: true,
})

jest.mock('../../context/TitleContext', () => ({
  useNestedListViewTitle: () => useNestedListViewTitleMock(),
}))

describe('useNextHeaderTag', () => {
  it('should return default for nested-list-view', () => {
    const {result} = renderHook(() => useNextHeaderTag('nested-list-view'))
    expect(result.current).toEqual('h2')
  })

  it('should return default for nested-list-view-metadata', () => {
    const {result} = renderHook(() => useNextHeaderTag('nested-list-view-metadata'))
    expect(result.current).toEqual('h3')
  })

  it('should return default for listitem', () => {
    const {result} = renderHook(() => useNextHeaderTag('nested-listitem'))
    expect(result.current).toEqual('h4')
  })

  it('should return title header tag for nested-list-view', () => {
    useNestedListViewTitleMock.mockReturnValue({
      titleHeaderTag: 'h3',
      hasMetadataTitle: true,
    })
    const {result} = renderHook(() => useNextHeaderTag('nested-list-view'))

    expect(result.current).toEqual('h3')
  })

  it('returns tag for listitem without nested-list-view-metadata title', () => {
    useNestedListViewTitleMock.mockReturnValue({
      titleHeaderTag: 'h3',
      hasMetadataTitle: false,
    })
    const {result} = renderHook(() => useNextHeaderTag('nested-listitem'))

    expect(result.current).toEqual('h4')
  })

  it('returns h6 when titleTag is h6', () => {
    useNestedListViewTitleMock.mockReturnValue({
      titleHeaderTag: 'h6',
      hasMetadataTitle: true,
    })
    const {
      result: {current: nestedListViewTag},
    } = renderHook(() => useNextHeaderTag('nested-list-view'))
    const {
      result: {current: metadataTag},
    } = renderHook(() => useNextHeaderTag('nested-list-view-metadata'))
    const {
      result: {current: listitemTag},
    } = renderHook(() => useNextHeaderTag('nested-listitem'))

    expect(nestedListViewTag).toEqual('h6')
    expect(metadataTag).toEqual('h6')
    expect(listitemTag).toEqual('h6')
  })
})
