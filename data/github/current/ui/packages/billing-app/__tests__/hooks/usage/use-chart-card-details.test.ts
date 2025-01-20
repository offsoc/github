import {renderHook} from '@testing-library/react'

import {useChartCardDetails} from '../../../hooks/usage'
import {
  CUSTOMER_SELECTIONS,
  DEFAULT_FILTERS,
  GROUP_SELECTIONS,
  MOCK_LINE_ITEMS,
  MOCK_REPO_LINE_ITEMS,
  MOCK_OTHER_USAGE_LINE_ITEMS,
  PERIOD_SELECTIONS,
} from '../../../test-utils/mock-data'

import type {CustomerSelection} from '../../../types/usage'

describe('UseChartCardDetails', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2023-12-01'))
  })
  afterAll(() => {
    jest.useRealTimers()
  })

  describe('data', () => {
    const expectedDataLength = MOCK_LINE_ITEMS.length + 2
    const expectedHourUtc = 12

    beforeAll(() => {
      // Set the date manually to prevent flakiness
      jest.useFakeTimers().setSystemTime(new Date(2023, 11, expectedDataLength, expectedHourUtc))
    })

    afterAll(() => {
      jest.useRealTimers()
    })

    it('Should return default data', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_LINE_ITEMS,
          filters: DEFAULT_FILTERS,
        }),
      )

      expect(result.current.data.datasets.length).toEqual(1)

      const usageData = result.current.data.datasets[0]?.data
      expect(usageData?.length).toEqual(5)
      expect(usageData?.filter(d => d.custom.grossAmount > 0)?.length).toEqual(3)

      const datasetLabels = result.current.data.datasets.map(d => d.name)
      expect(datasetLabels).toContain('Usage')
    })

    it('Should return fallback data when filters are blank', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_LINE_ITEMS,
          filters: {
            customer: CUSTOMER_SELECTIONS[0] as CustomerSelection,
            period: undefined,
            group: undefined,
            product: undefined,
            searchQuery: '',
          },
        }),
      )

      expect(result.current.data.datasets.length).toEqual(1)

      const usageData = result.current.data.datasets[0]?.data
      expect(usageData?.length).toEqual(5)
      expect(usageData?.filter(d => d.custom.grossAmount > 0)?.length).toEqual(3)

      const datasetLabels = result.current.data.datasets.map(d => d.name)
      expect(datasetLabels).toContain('Usage')
    })

    it('Should return usage grouped by product', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_LINE_ITEMS,
          filters: {...DEFAULT_FILTERS, group: GROUP_SELECTIONS[1]},
        }),
      )

      expect(result.current.data.datasets.length).toEqual(2)

      const datasetLabels = result.current.data.datasets.map(d => d.name)
      expect(datasetLabels).toContain('actions')
      expect(datasetLabels).toContain('shared_storage')

      const actionsData = result.current.data.datasets.find(d => d.name === 'actions')?.data
      // Data is filled in to the current date
      expect(actionsData?.length).toEqual(expectedDataLength)
      expect(actionsData?.filter(d => d.custom.grossAmount > 0).length).toEqual(2)

      const sharedStorageDataset = result.current.data.datasets
        .find(d => d.name === 'shared_storage')
        ?.data.filter(d => d.custom.grossAmount > 0)
      expect(sharedStorageDataset?.length).toEqual(1)
    })

    it('Should return all yearly usage', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_LINE_ITEMS,
          filters: {...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[3]},
        }),
      )

      expect(result.current.data.datasets.length).toEqual(1)

      const usageData = result.current.data.datasets[0]?.data
      expect(usageData?.length).toEqual(12)
      expect(usageData?.filter(d => d.custom.grossAmount > 0)?.length).toEqual(3)
    })

    it('Should return all daily usage', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_LINE_ITEMS,
          filters: {...DEFAULT_FILTERS, period: PERIOD_SELECTIONS[1]},
        }),
      )

      expect(result.current.data.datasets.length).toEqual(1)

      const usageData = result.current.data.datasets[0]?.data
      // Possible Flake: We have to take the time zone difference into account here otherwise this test will flake
      const expectedPoints = new Date().getTimezoneOffset() / 60 + 1 + expectedHourUtc
      expect(usageData?.length).toEqual(expectedPoints)
      expect(usageData?.filter(d => d.custom.grossAmount > 0)?.length).toEqual(3)
    })

    it('Should return monthly usage by product', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_LINE_ITEMS,
          filters: {...DEFAULT_FILTERS, group: GROUP_SELECTIONS[1]},
        }),
      )

      expect(result.current.data.datasets.length).toEqual(2)

      const datasetLabels = result.current.data.datasets.map(d => d.name)
      expect(datasetLabels).toContain('actions')
      expect(datasetLabels).toContain('shared_storage')

      const actionsData = result.current.data.datasets.find(d => d.name === 'actions')?.data
      expect(actionsData?.length).toEqual(5)
      expect(actionsData?.filter(d => d.custom.grossAmount > 0).length).toEqual(2)

      const sharedStorageDataset = result.current.data.datasets.find(d => d.name === 'shared_storage')?.data
      expect(sharedStorageDataset?.length).toEqual(5)
      expect(sharedStorageDataset?.filter(d => d.custom.grossAmount > 0).length).toEqual(1)
    })

    it('Should return usage grouped by sku', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_LINE_ITEMS,
          filters: {...DEFAULT_FILTERS, group: GROUP_SELECTIONS[2]},
        }),
      )

      expect(result.current.data.datasets.length).toEqual(3)

      const datasetLabels = result.current.data.datasets.map(d => d.name)
      expect(datasetLabels).toContain('Shared Storage')
      expect(datasetLabels).toContain('Windows 4-core')
      expect(datasetLabels).toContain('Macos 12-core')

      const actionsDefaultData = result.current.data.datasets.find(d => d.name === 'Shared Storage')?.data
      expect(actionsDefaultData?.length).toEqual(5)
      expect(actionsDefaultData?.filter(d => d.custom.grossAmount > 0).length).toEqual(1)

      const windowsData = result.current.data.datasets.find(d => d.name === 'Windows 4-core')?.data
      expect(windowsData?.length).toEqual(5)
      expect(windowsData?.filter(d => d.custom.grossAmount > 0).length).toEqual(1)

      const macOSData = result.current.data.datasets.find(d => d.name === 'Macos 12-core')?.data
      expect(macOSData?.length).toEqual(5)
      expect(macOSData?.filter(d => d.custom.grossAmount > 0).length).toEqual(1)
    })

    it('Should return usage grouped by repo', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_REPO_LINE_ITEMS,
          filters: {...DEFAULT_FILTERS, group: GROUP_SELECTIONS[4]},
        }),
      )

      expect(result.current.data.datasets.length).toEqual(7)

      const datasetLabels = result.current.data.datasets.map(d => d.name)
      expect(datasetLabels).toContain('test-org-a/test-repo-a')
      expect(datasetLabels).toContain('test-org-b/test-repo-a')
    })

    it('Should return usage grouped by org', () => {
      const {result} = renderHook(() =>
        useChartCardDetails({
          usage: MOCK_REPO_LINE_ITEMS,
          filters: {...DEFAULT_FILTERS, group: GROUP_SELECTIONS[3]},
        }),
      )

      expect(result.current.data.datasets.length).toEqual(6)

      const datasetLabels = result.current.data.datasets.map(d => d.name)
      expect(datasetLabels).toContain('test-org-a')
      expect(datasetLabels).toContain('test-org-b')
    })

    describe('Other usage', () => {
      it('Does not include other usage data when otherUsage is empty', () => {
        const {result} = renderHook(() =>
          useChartCardDetails({
            usage: MOCK_REPO_LINE_ITEMS,
            filters: DEFAULT_FILTERS,
            otherUsage: [],
          }),
        )

        const datasetLabels = result.current.data.datasets.map(d => d.name)
        expect(datasetLabels).not.toContain('All other')
      })

      it('Includes other usage data when otherUsage is present', () => {
        const {result} = renderHook(() =>
          useChartCardDetails({
            usage: MOCK_REPO_LINE_ITEMS,
            filters: DEFAULT_FILTERS,
            otherUsage: MOCK_OTHER_USAGE_LINE_ITEMS,
          }),
        )

        const datasetLabels = result.current.data.datasets.map(d => d.name)
        expect(datasetLabels).toContain('All other')
      })
    })
  })
})
