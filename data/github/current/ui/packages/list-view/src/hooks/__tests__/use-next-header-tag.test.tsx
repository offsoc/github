import {renderHook} from '@testing-library/react'

import {defaultTitleHeaderTag} from '../../constants'
import {useNextHeaderTag} from '../use-next-header-tag'

const useListViewTitleMock = jest.fn().mockReturnValue({
  titleHeaderTag: defaultTitleHeaderTag,
  hasMetadataTitle: true,
})

jest.mock('../../ListView/TitleContext', () => ({
  useListViewTitle: () => useListViewTitleMock(),
}))

it('should return default for list-view', () => {
  const {result} = renderHook(() => useNextHeaderTag('list-view'))
  expect(result.current).toEqual('h2')
})

it('should return default for list-view-metadata', () => {
  const {result} = renderHook(() => useNextHeaderTag('list-view-metadata'))
  expect(result.current).toEqual('h3')
})

it('should return default for listitem', () => {
  const {result} = renderHook(() => useNextHeaderTag('listitem'))
  expect(result.current).toEqual('h4')
})

it('should return title header tag for list-view', () => {
  useListViewTitleMock.mockReturnValue({
    titleHeaderTag: 'h3',
    hasMetadataTitle: true,
  })
  const {result} = renderHook(() => useNextHeaderTag('list-view'))

  expect(result.current).toEqual('h3')
})

it('returns tag for listitem without list-view-metadata title', () => {
  useListViewTitleMock.mockReturnValue({
    titleHeaderTag: 'h3',
    hasMetadataTitle: false,
  })
  const {result} = renderHook(() => useNextHeaderTag('listitem'))

  expect(result.current).toEqual('h4')
})

it('returns h6 when titleTag is h6', () => {
  useListViewTitleMock.mockReturnValue({
    titleHeaderTag: 'h6',
    hasMetadataTitle: true,
  })
  const {
    result: {current: listViewTag},
  } = renderHook(() => useNextHeaderTag('list-view'))
  const {
    result: {current: metadataTag},
  } = renderHook(() => useNextHeaderTag('list-view-metadata'))
  const {
    result: {current: listitemTag},
  } = renderHook(() => useNextHeaderTag('listitem'))

  expect(listViewTag).toEqual('h6')
  expect(metadataTag).toEqual('h6')
  expect(listitemTag).toEqual('h6')
})
