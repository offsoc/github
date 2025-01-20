import {buildMockRepository, buildMockTemplate, type MockRepository} from '../../__tests__/helpers'
import {
  appendChooseToBasePath,
  getPotentialFormDefaultValuesFromUrl,
  relativeIssueNewPathFromExisting,
  newIssueWithTemplateParams,
  removeChooseFromBasePath,
  safeStringArrayParamSet,
  safeStringParamGet,
  safeStringParamSet,
  appendNewToBasePath,
  isChooseRoute,
  isNewRoute,
} from '../urls'

test('correctly gets new issue path URL from `issueNewPathFromExisting`', () => {
  expect(relativeIssueNewPathFromExisting('/issues')).toBe('/issues/new')
  expect(relativeIssueNewPathFromExisting('/issues/')).toBe('/issues/new')
  expect(relativeIssueNewPathFromExisting('/issues/assigned/')).toBe('/issues/new')
  expect(relativeIssueNewPathFromExisting('/issues/somethingrandom')).toBe('/issues/new')
  expect(relativeIssueNewPathFromExisting('/testowner/repo/issues')).toBe('/testowner/repo/issues/new')
  expect(relativeIssueNewPathFromExisting('/testowner/repo/issues/assigned')).toBe('/testowner/repo/issues/new')
  expect(relativeIssueNewPathFromExisting('/testowner/repo/issues?someparam=true')).toBe('/testowner/repo/issues/new')
  expect(relativeIssueNewPathFromExisting('/testowner/repo/issues/123')).toBe('/testowner/repo/issues/new')
  expect(relativeIssueNewPathFromExisting('/testowner/repo/issues/123/123/')).toBe('/testowner/repo/issues/new')
  expect(relativeIssueNewPathFromExisting('/github/issues/issues')).toBe('/github/issues/issues/new')
  expect(relativeIssueNewPathFromExisting('/github/issues/issues/123?test=true')).toBe('/github/issues/issues/new')
})

test('correctly asserts choose path', () => {
  expect(isChooseRoute(undefined)).toBe(false)
  expect(isChooseRoute('/issues/new')).toBe(false)
  expect(isChooseRoute('/issues/new/choose')).toBe(true)
})

test('correctly gets new issue path URL from `appendChooseToBasePath`', () => {
  expect(appendChooseToBasePath('/testowner/repo')).toBe('/testowner/repo/issues/new/choose')
  expect(appendChooseToBasePath('/testowner/repo/')).toBe('/testowner/repo/issues/new/choose')
  expect(appendChooseToBasePath('')).toBe('/issues/new/choose')
  expect(appendChooseToBasePath('https://github.com/owner/myrepo/')).toBe(
    'https://github.com/owner/myrepo/issues/new/choose',
  )
  expect(appendChooseToBasePath('https://github.com/owner/myrepo')).toBe(
    'https://github.com/owner/myrepo/issues/new/choose',
  )
})

test('correctly gets new issue path URL from `appendNewToBasePath`', () => {
  expect(appendNewToBasePath('/testowner/repo')).toBe('/testowner/repo/issues/new')
  expect(appendNewToBasePath('/testowner/repo/')).toBe('/testowner/repo/issues/new')
  expect(appendNewToBasePath('')).toBe('/issues/new')
  expect(appendNewToBasePath('https://github.com/owner/myrepo/')).toBe('https://github.com/owner/myrepo/issues/new')
  expect(appendNewToBasePath('https://github.com/owner/myrepo')).toBe('https://github.com/owner/myrepo/issues/new')
})

test('`safeStringParamGet` correctly gets string limited by length', () => {
  const longLengthString = 'really_really_long_length'
  const shortLengthString = 'short'
  const testSearchParams = new URLSearchParams(`long=${longLengthString}&short=${shortLengthString}`)
  expect(safeStringParamGet(testSearchParams, 'long', 5)).toBe(longLengthString.substring(0, 5))
  expect(safeStringParamGet(testSearchParams, 'short', shortLengthString.length)).toBe(shortLengthString)
})

test('`safeStringParamSet` correctly sets string with limit', () => {
  const longLengthString = 'really_really_long_length'
  const shortLengthString = 'short'
  const testSearchParams = new URLSearchParams()
  safeStringParamSet(testSearchParams, 'long', longLengthString, 5)
  safeStringParamSet(testSearchParams, 'short', shortLengthString, shortLengthString.length)
  expect(testSearchParams.get('long')).toBe(longLengthString.substring(0, 5))
  expect(testSearchParams.get('short')).toBe(shortLengthString)
})

test('`safeStringParamSet` doesnt set undefined values', () => {
  const undefinedKey = 'some-key'
  const testSearchParams = new URLSearchParams()
  safeStringParamSet(testSearchParams, undefinedKey, undefined, 5)
  expect(testSearchParams.get(undefinedKey)).toBeNull()
})

test('`safeStringArrayParamSet` correct sets array limits', () => {
  const longStringArray = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  const testSearchParams = new URLSearchParams()
  safeStringArrayParamSet(testSearchParams, 'short', longStringArray, 5)
  expect(testSearchParams.get('short')).toBe('1,2,3,4,5')
  safeStringArrayParamSet(testSearchParams, 'long', longStringArray, 10)
  expect(testSearchParams.get('long')).toBe('1,2,3,4,5,6,7,8,9,10')
  safeStringArrayParamSet(testSearchParams, 'emptyArray', [], 5)
  expect(testSearchParams.get('emptyArray')).toBe('')
  safeStringArrayParamSet(testSearchParams, 'empty', undefined, 5)
  expect(testSearchParams.get('empty')).toBeNull()
})

test('`removeChooseFromBasePath` correctly removes choose from base path', () => {
  expect(removeChooseFromBasePath('/issues/choose')).toBe('/issues')
  expect(removeChooseFromBasePath('/issues/choose/')).toBe('/issues')
  expect(removeChooseFromBasePath('/choose/issues/new/choose')).toBe('/choose/issues/new')
  expect(removeChooseFromBasePath('/choose/issues/new/choose/')).toBe('/choose/issues/new')
  expect(removeChooseFromBasePath('/choose/issues/new')).toBe('/choose/issues/new')
  expect(removeChooseFromBasePath('/another-choose/choose/issues/new/choose')).toBe('/another-choose/choose/issues/new')
})

test('`getPotentialFormDefaultValuesFromUrl` correctly gets non-reserved keywords', () => {
  const reservedOnlyParams = new URLSearchParams(
    'title=hello&body=world&assignees=octocat&labels=bug&projects=octo%2Fproject&milestone=1',
  )

  expect(Object.keys(getPotentialFormDefaultValuesFromUrl(reservedOnlyParams)).length).toEqual(0)

  const includesNonReservedParams = new URLSearchParams('test=hello&test2=world&title=asd')
  const filteredParams = getPotentialFormDefaultValuesFromUrl(includesNonReservedParams)
  expect(Object.keys(filteredParams).length).toEqual(2)
  expect(filteredParams.test).toEqual('hello')
  expect(filteredParams.test2).toEqual('world')

  const emptyParams = new URLSearchParams('test=&test2=')
  const emptyFilteredParams = getPotentialFormDefaultValuesFromUrl(emptyParams)
  expect(Object.keys(emptyFilteredParams).length).toEqual(2)
  expect(emptyFilteredParams.test).toEqual('')
  expect(emptyFilteredParams.test2).toEqual('')
})

test('`newIssueWithTemplateParams` correctly populates template params', () => {
  const mockTemplate = buildMockTemplate({name: 'MockTemplate', fileName: 'MockTemplate.md'})
  const mockRepo: MockRepository = buildMockRepository({name: 'test', owner: 'me'})

  expect(
    newIssueWithTemplateParams({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      repository: mockRepo as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      template: mockTemplate as any,
      preselectedRepository: undefined,
    }),
  ).toEqual('/issues/new?org=me&repo=test&template=MockTemplate.md')

  expect(
    newIssueWithTemplateParams({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      repository: mockRepo as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      template: mockTemplate as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      preselectedRepository: mockRepo as any,
    }),
  ).toEqual('/issues/new?template=MockTemplate.md')
})

test('correctly asserts new path', () => {
  expect(isNewRoute(undefined)).toBe(false)
  expect(isNewRoute('/issues/new')).toBe(true)
  expect(isNewRoute('/issues/new/choose')).toBe(false)
})
