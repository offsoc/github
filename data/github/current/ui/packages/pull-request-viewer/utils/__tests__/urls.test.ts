import {parseCommitRange, pullRequestUrl} from '../urls'

describe('pullRequestUrl', () => {
  test('returns the route for a pull request when given correct arguments', () => {
    const url = pullRequestUrl({owner: 'monalisa', repoName: 'smile', number: '1'})
    expect(url).toEqual('/monalisa/smile/pull/1')
  })
  test('throws an error if given an undefined argument', () => {
    expect(() => pullRequestUrl({owner: undefined, repoName: 'smile', number: '1'})).toThrow(
      'Cannot generate pull request url',
    )
  })
})

describe('parseCommitRange', () => {
  test('returns single commit oid', () => {
    const result = parseCommitRange('e3884b7d64007768b0240b22dceaa8fc3537731c')
    expect(result).toEqual({singleCommitOid: 'e3884b7d64007768b0240b22dceaa8fc3537731c'})
  })

  test('returns undefined for malformed single commit oid', () => {
    const result = parseCommitRange('jkle3884b7d64007768b0240b22dceaa8fc3537731c')
    expect(result).toBeUndefined()
  })

  test('returns commit range', () => {
    const result = parseCommitRange(
      'e3884b7d64007768b0240b22dceaa8fc3537731c..a9abc6e361fb2bece63858eff142ea361637aa5a',
    )
    expect(result).toEqual({
      startOid: 'e3884b7d64007768b0240b22dceaa8fc3537731c',
      endOid: 'a9abc6e361fb2bece63858eff142ea361637aa5a',
    })
  })

  test('returns undefined for malformed commit range', () => {
    const result = parseCommitRange(
      'jkle3884b7d64007768b0240b22dceaa8fc3537731c..a9abc6e361fb2bece63858eff142ea361637aa5a',
    )
    expect(result).toBeUndefined()
  })
})
