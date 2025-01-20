import {FilterUtils} from '../../../common/utils/filter-utils'
import {Services} from '../../../common/services/services'
import type {FilterProvider} from '@github-ui/filter'
import {DataService} from '../../../common/services/data-service'
import {MockDataService} from '../../test-utils/common/services/data-service.mock'
import {registerServices} from '../../../common/services/service-registrations'
import type {FilterValue} from '../../../common/models/models'
import {OperatorType} from '../../../common/models/enums'
import {getUsageFilters} from '../../../views/usage/utils/filter-providers'

let filterProviders: FilterProvider[] = []
describe('actions-metrics filter-utils', () => {
  beforeAll(() => {
    registerServices()
    Services.add(DataService.serviceId, () => new MockDataService(() => new Response()))
    filterProviders = getUsageFilters()
  })

  it('should parse simple filter correctly', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, 'repository:repo1')
    expect(filters![0]?.key).toEqual('repository')
    expect(filters![0]?.values![0]).toEqual('repo1')
    expect(filters![0]?.operator).toEqual(OperatorType.Equals)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('repository:repo1')
  })

  it('should parse filters with quotes correctly', async () => {
    const filters = FilterUtils.parseFilter(
      filterProviders,
      'repository:repo1 workflow_file_name:"0test with spaces","1other test with spaces" total_minutes:1',
    )

    expect(filters?.length).toEqual(3)

    const repoFilter = findFilter(filters, 'repository')
    const workflowFilter = findFilter(filters, 'workflow_file_name')
    const minutesFilter = findFilter(filters, 'total_minutes')

    expect(repoFilter?.key).toEqual('repository')
    expect(repoFilter?.values![0]).toEqual('repo1')
    expect(workflowFilter?.key).toEqual('workflow_file_name')
    expect(workflowFilter?.values![0]).toEqual('0test with spaces')
    expect(workflowFilter?.values![1]).toEqual('1other test with spaces')
    expect(minutesFilter?.key).toEqual('total_minutes')
    expect(minutesFilter?.values![0]).toEqual('1')
    expect(FilterUtils.stringifyFilters(filters)).toEqual(
      'repository:repo1 workflow_file_name:"0test with spaces","1other test with spaces" total_minutes:1',
    )
  })

  it('should parse filters with quotes correctly when quoted values are mixed with unquoted', async () => {
    const filters = FilterUtils.parseFilter(
      filterProviders,
      'repository:repo1 workflow_file_name:0no_space_value,"1test with spaces",2no_space_value,"3test with spaces" total_minutes:1',
    )

    expect(filters?.length).toEqual(3)

    const repoFilter = findFilter(filters, 'repository')
    const workflowFilter = findFilter(filters, 'workflow_file_name')
    const minutesFilter = findFilter(filters, 'total_minutes')

    expect(repoFilter?.key).toEqual('repository')
    expect(repoFilter?.values![0]).toEqual('repo1')
    expect(workflowFilter?.key).toEqual('workflow_file_name')
    expect(workflowFilter?.values![0]).toEqual('0no_space_value')
    expect(workflowFilter?.values![1]).toEqual('1test with spaces')
    expect(workflowFilter?.values![2]).toEqual('2no_space_value')
    expect(workflowFilter?.values![3]).toEqual('3test with spaces')
    expect(minutesFilter?.key).toEqual('total_minutes')
    expect(minutesFilter?.values![0]).toEqual('1')
    expect(FilterUtils.stringifyFilters(filters)).toEqual(
      'repository:repo1 workflow_file_name:0no_space_value,"1test with spaces",2no_space_value,"3test with spaces" total_minutes:1',
    )
  })

  it('should parse exclude filters', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, '-repository:repo1')

    expect(filters![0]?.key).toEqual('repository')
    expect(filters![0]?.values![0]).toEqual('repo1')
    expect(filters![0]?.operator).toEqual(OperatorType.NotEquals)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('-repository:repo1')
  })

  it('should parse GreaterEqualTo filter', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, 'total_minutes:>=1')

    expect(filters![0]?.key).toEqual('total_minutes')
    expect(filters![0]?.values![0]).toEqual('1')
    expect(filters![0]?.operator).toEqual(OperatorType.GreaterEqualTo)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('total_minutes:>=1')
  })

  it('should parse LessEqualTo filter', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, 'total_minutes:<=1')

    expect(filters![0]?.key).toEqual('total_minutes')
    expect(filters![0]?.values![0]).toEqual('1')
    expect(filters![0]?.operator).toEqual(OperatorType.LessEqualTo)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('total_minutes:<=1')
  })

  it('should parse GreaterThan filter', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, 'total_minutes:>1')

    expect(filters![0]?.key).toEqual('total_minutes')
    expect(filters![0]?.values![0]).toEqual('1')
    expect(filters![0]?.operator).toEqual(OperatorType.GreaterThan)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('total_minutes:>1')
  })

  it('should parse LessThan filter', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, 'total_minutes:<1')

    expect(filters![0]?.key).toEqual('total_minutes')
    expect(filters![0]?.values![0]).toEqual('1')
    expect(filters![0]?.operator).toEqual(OperatorType.LessThan)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('total_minutes:<1')
  })

  it('should parse Between filter', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, 'total_minutes:1..5')

    expect(filters![0]?.key).toEqual('total_minutes')
    expect(filters![0]?.values![0]).toEqual('1')
    expect(filters![0]?.values![1]).toEqual('5')
    expect(filters![0]?.operator).toEqual(OperatorType.Between)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('total_minutes:1..5')
  })

  it('should parse text filter with multiple separate words', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, '0text 1text')

    expect(filters!.length).toEqual(2)
    expect(filters![0]?.key).toEqual('text')
    expect(filters![0]?.values![0]).toEqual('0text')
    expect(filters![1]?.key).toEqual('text')
    expect(filters![1]?.values![0]).toEqual('1text')
    expect(filters![0]?.operator).toEqual(OperatorType.Contains)
    expect(filters![1]?.operator).toEqual(OperatorType.Contains)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('0text 1text')
  })

  it('should parse text filter with quoted string', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, '"text and some more text"')

    expect(filters!.length).toEqual(1)
    expect(filters![0]?.key).toEqual('text')
    expect(filters![0]?.values![0]).toEqual('text and some more text')
    expect(filters![0]?.operator).toEqual(OperatorType.Contains)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('"text and some more text"')
  })

  it('should parse empty quoted string as a value', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, 'repository:""')

    expect(filters!.length).toEqual(1)
    expect(filters![0]?.key).toEqual('repository')
    expect(filters![0]?.values![0]).toEqual('""')
    expect(filters![0]?.operator).toEqual(OperatorType.Equals)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('repository:""')
  })

  it('should allow quotes within a value', async () => {
    const filters = FilterUtils.parseFilter(filterProviders, 'repository:start"middle"end')

    expect(filters!.length).toEqual(1)
    expect(filters![0]?.key).toEqual('repository')
    expect(filters![0]?.values![0]).toEqual('start"middle"end')
    expect(filters![0]?.operator).toEqual(OperatorType.Equals)
    expect(FilterUtils.stringifyFilters(filters)).toEqual('repository:start"middle"end')
  })
})

const findFilter = (filterValues?: FilterValue[], filterKey?: string) => {
  return filterValues?.find(f => f.key === filterKey)
}
