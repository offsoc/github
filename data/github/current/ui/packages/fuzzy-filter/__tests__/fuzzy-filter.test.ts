import {compare, fuzzyHighlightElement, fuzzyRegexp, fuzzyScore} from '../fuzzy-filter'
import {filterSort} from '@github-ui/filter-sort'

describe('fuzzyRegexp', function () {
  test('fuzzy regexp', function () {
    expect(fuzzyRegexp('f').toString()).toEqual('/(.*)(f)(.*?)$/i')
    expect(fuzzyRegexp('foo').toString()).toEqual('/(.*)(f)([^o]*?)(o)([^o]*?)(o)(.*?)$/i')
    expect(fuzzyRegexp('bar').toString()).toEqual('/(.*)(b)([^a]*?)(a)([^r]*?)(r)(.*?)$/i')
    expect(fuzzyRegexp('/').toString()).toEqual('/(.*)(\\/)(.*?)$/i')
    expect(fuzzyRegexp('.').toString()).toEqual('/(.*)(\\.)(.*?)$/i')
  })

  test('fuzzy highlight element', function () {
    function testHighlight(html: string, query: string, output: string) {
      const el = document.createElement('div')
      el.innerHTML = html
      fuzzyHighlightElement(el, query)
      expect(el.innerHTML).toEqual(output)
    }
    testHighlight('Foo', 'f', '<mark>F</mark>oo')
    testHighlight('Foo', 'fo', '<mark>Fo</mark>o')
    testHighlight('Foo', '', 'Foo')
    testHighlight('Bar', 'br', '<mark>B</mark>a<mark>r</mark>')
    testHighlight('foo.html', 'foo', '<mark>foo</mark>.html')
    testHighlight('app/models/user.rb', 'user', 'app/models/<mark>user</mark>.rb')
    testHighlight('app/models/user.rb', 'appuser', '<mark>app</mark>/models/<mark>user</mark>.rb')
  })

  test('fuzzy score', function () {
    expect(fuzzyScore('foo.html', 'f') > 0).toBeTruthy()
    expect(fuzzyScore('bar.html', 'f') === 0).toBeTruthy()
  })

  function testSort(query: string, original: string[], expected?: string[], prefixBonusWeighting = 0.1) {
    if (expected == null) {
      expected = original
    }
    const comparable = (text: string) => {
      const score = fuzzyScore(text, query, prefixBonusWeighting)
      return score > 0 ? {score, text} : null
    }
    const actual = filterSort(original, comparable, compare)
    expect(actual).toEqual(expected)
  }

  // eslint-disable-next-line jest/expect-expect
  test('fuzzy sort names', function () {
    testSort('jo', ['josh', 'joshaber', 'joshvera'])
    testSort('josh', ['josh', 'joshaber', 'joshvera'])
    testSort('josha', ['joshaber', 'joshvera', 'josh'], ['joshaber', 'joshvera'])
    testSort('v', ['joshvera', 'josh', 'joshaber'], ['joshvera'])
    testSort(
      'editors',
      ['editors b', 'b editors', 'editor something', 'b-editors', 'editorss-b'],
      ['editors b', 'b editors', 'b-editors', 'editorss-b', 'editor something'],
      0.01,
    )
    testSort(
      'terminalint',
      ['terminal-winpty', 'terminal-integration', 'terminal-input'],
      ['terminal-input', 'terminal-integration', 'terminal-winpty'],
      0.01,
    )
    testSort(
      'termintegrat',
      ['terminal', 'terminal-shell-integration', 'terminal-conpty'],
      ['terminal-shell-integration'],
      0.01,
    )
  })

  // eslint-disable-next-line jest/expect-expect
  test('fuzzy sort paths', function () {
    testSort(
      'user',
      [
        'app/models/user.rb',
        'app/api/users.rb',
        'test/models/user_test.rb',
        'app/controllers/users_controller.rb',
        'app/models/post.rb',
      ],
      ['app/models/user.rb', 'app/api/users.rb', 'test/models/user_test.rb', 'app/controllers/users_controller.rb'],
    )
    testSort(
      'pulse.html',
      [
        'app/views/repos/pulse.html.erb',
        'app/assets/javascripts/pulse.coffee',
        'app/controllers/pull_request_controller.rb',
        'app/models/post.rb',
      ],
      ['app/views/repos/pulse.html.erb'],
    )
    testSort(
      'app/views',
      ['app/views/users/show.html', 'app/controllers/users_controller.rb', 'app/models/user.rb'],
      ['app/views/users/show.html'],
    )
    testSort('store', [
      'activerecord/lib/active_record/store.rb',
      'activerecord/test/cases/store_test.rb',
      'Library/Formula/redstore.rb',
      'Library/Formula/fourstore.rb',
      'activerecord/test/.gitignore',
    ])
  })
})
