import {getQueriesByFilterValue} from '../query-parser'

describe('getQueriesByFilterValue', () => {
  it('should return default values when no filter is used', () => {
    const query = 'some query'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'dependabot']
    const expected = ['some query tool:dependabot', 'some query tool:codeql']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })

  it('should return included filter values when filter is used', () => {
    const query = 'some query tool:codeql,dependabot'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'dependabot']
    const expected = ['some query tool:dependabot', 'some query tool:codeql']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })

  it('should exclude excluded filter values when filter is used', () => {
    const query = 'some query tool:codeql,dependabot -tool:dependabot'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'dependabot']
    const expected = ['some query tool:codeql']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })

  it('should exclude excluded filter values that are in the defaults and pass the rest', () => {
    const query = 'some query -tool:dependabot,Grype,Trivy'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'dependabot', 'secret-scanning', 'third-party']
    const expected = [
      'some query -tool:Grype,Trivy tool:secret-scanning',
      'some query -tool:Grype,Trivy tool:codeql,third-party',
    ]
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })

  it('should only submit one request for third party alerts if excluding github', () => {
    const query = 'some query -tool:github'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'dependabot', 'secret-scanning', 'third-party']
    const expected = ['some query tool:third-party']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })

  it('should include non-filtered exclusions even if there is a positive tool', () => {
    const query = 'some query tool:codeql -tool:dependabot,Grype,Trivy'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'dependabot', 'secret-scanning', 'third-party']
    const expected = ['some query -tool:dependabot,Grype,Trivy tool:codeql']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })

  it('should not make queries if a positive tool is wiped out by negations', () => {
    const query = 'some query tool:dependabot -tool:dependabot,Grype,Trivy'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'dependabot', 'secret-scanning', 'third-party']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual([])
  })

  it('should keep a query if all core tools are wiped out by negation', () => {
    const query = 'some query -tool:dependabot,secret-scanning,codeql,Grype,Trivy'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'dependabot', 'secret-scanning', 'third-party']
    const expected = ['some query -tool:Grype,Trivy tool:third-party']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })

  it('should handle multiple filters', () => {
    const query = 'some query tool:codeql,dependabot -tool:dependabot language:typescript'

    const expected1 = ['some query language:typescript tool:codeql']
    expect(getQueriesByFilterValue(query, 'tool', ['codeql', 'dependabot'])).toEqual(expected1)

    const expected2 = ['some query tool:codeql,dependabot -tool:dependabot language:typescript']
    expect(getQueriesByFilterValue(query, 'language', ['javascript', 'typescript'])).toEqual(expected2)
  })

  it('should handle third party tools', () => {
    const query = 'some query tool:codeql,dependabot -tool:dependabot language:typescript'

    const filterName1 = 'tool'
    const filterDefaultValues1 = ['codeql', 'dependabot']
    const expected1 = ['some query language:typescript tool:codeql']
    expect(getQueriesByFilterValue(query, filterName1, filterDefaultValues1)).toEqual(expected1)

    const filterName2 = 'language'
    const filterDefaultValues2 = ['javascript', 'typescript']
    const expected2 = ['some query tool:codeql,dependabot -tool:dependabot language:typescript']
    expect(getQueriesByFilterValue(query, filterName2, filterDefaultValues2)).toEqual(expected2)
  })

  it('should handle multiple of the same tool', () => {
    const query = 'some query tool:codeql,codeql,dependabot,dependabot'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'secret-scanning']
    const expected = ['some query tool:dependabot', 'some query tool:codeql']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })

  it('should handle/separate out the github grouping', () => {
    const query = 'some query tool:github,codeql'
    const filterName = 'tool'
    const filterDefaultValues = ['codeql', 'secret-scanning']
    const expected = ['some query tool:dependabot', 'some query tool:secret-scanning', 'some query tool:codeql']
    expect(getQueriesByFilterValue(query, filterName, filterDefaultValues)).toEqual(expected)
  })
})
