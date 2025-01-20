import {insertText, replaceText, GetCharIndexFromBytePosition} from '../text'
import {assert, fixture, html, setup, suite, test} from '@github-ui/browser-tests'

suite('github/text', function () {
  suite('insertText', function () {
    setup(function () {
      fixture(html`<textarea class="js-text"></textarea>`)
    })

    test('inserts text at the cursor, starting with a newline', function () {
      const textarea = document.querySelector<HTMLTextAreaElement>('.js-text')!
      textarea.value = 'one two'
      textarea.selectionEnd = 3
      const inserted = insertText(textarea, 'hello')
      assert.equal(inserted, '\nhello')
      assert.equal(textarea.value, 'one\nhello two')
      assert.equal(textarea.selectionEnd, 9)
    })

    test('optionally allows appending a newline', function () {
      const textarea = document.querySelector<HTMLTextAreaElement>('.js-text')!
      textarea.value = 'one two'
      textarea.selectionEnd = 3
      const inserted = insertText(textarea, 'hello', {appendNewline: true})
      assert.equal(inserted, '\nhello\n')
      assert.equal(textarea.value, 'one\nhello\n two')
      assert.equal(textarea.selectionEnd, 10)
    })

    test('inserts text at the cursor, omitting the newline if the textarea is empty', function () {
      const textarea = document.querySelector<HTMLTextAreaElement>('.js-text')!
      textarea.value = ''
      textarea.selectionEnd = 0
      insertText(textarea, 'hello')
      assert.equal(textarea.value, 'hello')
      assert.equal(textarea.selectionEnd, 5)
    })
  })

  suite('replaceText', function () {
    setup(function () {
      fixture(html`<textarea class="js-text"></textarea>`)
    })

    test('replaces text but keeps cursor in place', function () {
      const textarea = document.querySelector<HTMLTextAreaElement>('.js-text')!
      textarea.value = 'one hello two'
      textarea.selectionEnd = 3
      replaceText(textarea, 'hello', 'goodbye')
      assert.equal(textarea.value, 'one goodbye two')
      assert.equal(textarea.selectionEnd, 3)
    })
  })

  // We test the char index returned by GetCharIndexFromBytePosition corrected from the actual byte offset
  // Example:
  //  the character 元 is written using 3 bytes (0xe5 0x85 0x83), so in the string '元foobar',
  //  the 'f' character is at byte position 3, but the char index is 1.
  //  In this case, we have a delta of 2, so we expect that GetCharIndexFromBytePosition(3) returns 3-2 = 1.
  suite('GetCharIndexFromBytePosition', function () {
    test('test string has a few non-English characters', async function () {
      // foobar1 has a delta of 2
      // foobar2 has a delta of 6
      // foobar3 has a delta of 10
      const str = `元foobar1全\r\n元foobar2全\r\n元foobar3全`
      assert.equal(1, GetCharIndexFromBytePosition(str, 3))
      assert.equal(8, GetCharIndexFromBytePosition(str, 10))
      assert.equal(12, GetCharIndexFromBytePosition(str, 18))
      assert.equal(19, GetCharIndexFromBytePosition(str, 25))
      assert.equal(22, GetCharIndexFromBytePosition(str, 32))
      assert.equal(29, GetCharIndexFromBytePosition(str, 39))
    })

    test('test string has symbols from all astral planes', async function () {
      // foobar has a delta of 13
      const str = 'Iñtërnâtiônàlizætiøn元☃💩foobar'
      assert.equal(24, GetCharIndexFromBytePosition(str, 37))
      assert.equal(30, GetCharIndexFromBytePosition(str, 43))
    })
  })
})
