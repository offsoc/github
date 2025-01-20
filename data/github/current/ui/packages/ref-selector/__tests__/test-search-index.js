import {SearchIndex} from '../search-index'
import {assert, setup, suite, teardown, test} from '@github-ui/browser-tests'

suite('SearchIndex', function () {
  let index
  let renders = 0
  // mock parent component
  const selector = {render: () => renders++}

  setup(function () {
    index = new SearchIndex('branch', selector, '/', 'cache-1', 'nwo')
  })

  teardown(function () {
    renders = 0
  })

  test('searching', function () {
    index.knownItems = ['abc', 'foo-1', 'foo', '123-foo', 'abcfoo123']
    index.search('foo')
    assert.deepEqual(index.currentSearchResult, ['foo', 'foo-1', '123-foo', 'abcfoo123'])
    assert.isTrue(index.exactMatchFound)

    // extra test that prefix matches are always first regardless of their position in the corpus
    index.knownItems = ['blah', 'whatever-test', 'my-test-string', 'test-123']
    index.search('test')
    assert.equal(index.currentSearchResult.length, 3)
    assert.equal(index.currentSearchResult[0], 'test-123')
    assert.isFalse(index.exactMatchFound)

    // test emoji searching
    index.knownItems = ['abc', 'foo-1', 'foo', '123-foo', 'abcfoo123', 'makes-me-want-to-😃', '😃 :)', '😃']
    index.search('😃')
    assert.equal(index.currentSearchResult.length, 3)
    assert.equal(index.currentSearchResult[0], '😃')
    assert.equal(index.currentSearchResult[1], '😃 :)')
    assert.equal(index.currentSearchResult[2], 'makes-me-want-to-😃')
    assert.isTrue(index.exactMatchFound)
  })

  test('localstorage roundtripping', function () {
    const response = {
      refs: ['foo-1', 'abc-foo'],
      cacheKey: 'cache-123',
    }
    index.flushToLocalStorage(JSON.stringify(response))

    // assert that a new index object loads from localstorage
    let dupIndex = new SearchIndex('branch', selector, '/', 'cache-123', 'nwo')
    dupIndex.bootstrapFromLocalStorage()
    assert.deepEqual(dupIndex.knownItems, response.refs)

    // assert that a new index with a later cache-key doesn't use the stale data
    dupIndex = new SearchIndex('branch', selector, '/', 'cache-456', 'nwo')
    dupIndex.bootstrapFromLocalStorage()
    assert.notDeepEqual(dupIndex.knownItems, response.refs)

    // assert that a new index with a different nwo doesn't use the data
    dupIndex = new SearchIndex('branch', selector, '/', 'cache-123', 'other-nwo')
    dupIndex.bootstrapFromLocalStorage()
    assert.notDeepEqual(dupIndex.knownItems, response.refs)
  })
})
