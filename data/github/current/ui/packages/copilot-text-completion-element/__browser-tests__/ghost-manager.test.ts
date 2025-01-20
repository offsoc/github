import {assert, fixture, html, suite, test} from '@github-ui/browser-tests'
import {GhostManager} from '../ghost-manager'
import type {TextRuler} from '../text-ruler'
import {ScreenReaderManager} from '../screen-reader-manager'
import {spy, stub, restore} from 'sinon'

import {featureFlag} from '@github-ui/feature-flags'
import {GhostTextArea} from '../ghost'

suite("Ghost Manager's office is always open", () => {
  let source: HTMLTextAreaElement
  let ghost: HTMLTextAreaElement
  let ruler: TextRuler
  let manager: GhostManager
  let fileAttachmentClass: string = 'is-default'

  setup(async function () {
    stub(featureFlag, 'isFeatureEnabled').returns(true)
    const markup = await fixture(
      html`<file-attachment class="${fileAttachmentClass}">
        <textarea id="source"></textarea><textarea id="ghost"></textarea>
      </file-attachment>`,
    )
    source = markup.querySelector('#source')!
    ghost = markup.querySelector('#ghost')!
    ruler = {
      // For our testing don't bother with wrapping that needs a real textarea
      // (which the fixture doesn't do properly). Just count newlines
      getNumberOfLines: (text: string) => text.split('\n').length,
    }
    fileAttachmentClass = 'is-default'
    const screenReaderManager = new ScreenReaderManager(undefined, undefined, undefined)
    manager = new GhostManager(source, new GhostTextArea(ghost), ruler, screenReaderManager)
  })

  teardown(() => {
    restore()
  })

  suite('hasSuggestion', () => {
    test('no suggestion', () => {
      manager.currentSuggestion = null
      assert.isFalse(manager.hasSuggestion())
    })

    test('as suggested', () => {
      manager.currentSuggestion = 'try this'
      assert.isTrue(manager.hasSuggestion())
    })
  })

  // Most permutation testing delegated to helper it uses
  suite('shouldCompleteHere', () => {
    test('sure ', () => {
      source.value = 'test'
      source.selectionStart = source.selectionEnd = source.value.length
      assert.isTrue(manager.shouldCompleteHere())
    })

    test('notWithMultiCharacterHighlight', () => {
      source.value = 'text'
      source.selectionStart = 0
      source.selectionEnd = 1
      assert.isFalse(manager.shouldCompleteHere())
    })

    test('notAtNewLine', () => {
      source.value = 'text\n'
      source.selectionStart = source.selectionEnd = 1
      assert.isFalse(manager.shouldCompleteHere())
    })

    test('notAtEnd', () => {
      source.value = 'text'
      source.selectionStart = source.selectionEnd = 1
      assert.isFalse(manager.shouldCompleteHere())
    })

    test('notEmpty', () => {
      source.value = ''
      source.selectionStart = 0
      source.selectionEnd = 0
      assert.isFalse(manager.shouldCompleteHere())
    })

    test('atNewLine', () => {
      source.value = 'text\n'
      source.selectionStart = source.selectionEnd = 4
      assert.isTrue(manager.shouldCompleteHere())
    })

    test('atEnd', () => {
      source.value = 'text'
      source.selectionStart = source.selectionEnd = 4
      assert.isTrue(manager.shouldCompleteHere())
    })

    test('while waiting on file upload', () => {
      source.value = 'text'
      source.selectionStart = source.selectionEnd = source.value.length
      fileAttachmentClass = 'is-uploading'
      assert.isFalse(manager.shouldCompleteHere())
    })

    test('while waiting on a copilot outline', () => {
      source.value = '[Copilot is generating an outline...]'
      source.selectionStart = source.selectionEnd = source.value.length
      assert.isFalse(manager.shouldCompleteHere())
    })

    test('while waiting on a copilot summary', () => {
      source.value = '[Copilot is generating a summary...]'
      source.selectionStart = source.selectionEnd = source.value.length
      assert.isFalse(manager.shouldCompleteHere())
    })
  })

  suite('showCompletion', () => {
    test('basic suggestion', () => {
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4

      const suggestion = 'ing!'
      manager.showCompletion(suggestion, 4, 'context')

      assert.isTrue(manager.hasSuggestion())
      assert.equal(source.value, 'test')
      assert.equal(source.selectionStart, 4)
      assert.equal(ghost.value, 'testing!')
      assert.equal(ghost.scrollTop, source.scrollTop)
      assert.equal(manager.currentRawContext, 'context')
    })

    test('multiline suggestion', () => {
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4

      const suggestion = 'ing!\nMatters!'
      manager.showCompletion(suggestion, 4, 'context')

      assert.isTrue(manager.hasSuggestion())
      assert.equal(source.value, 'test\n')
      assert.equal(source.selectionStart, 4)
      assert.equal(ghost.value, 'testing!\nMatters!')
      assert.equal(ghost.scrollTop, source.scrollTop)
      assert.equal(manager.currentRawContext, 'context')
    })

    test('last suggestion wins', () => {
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4

      const ignoredSuggestion = 'ing!\nMatters!'
      manager.showCompletion(ignoredSuggestion, 4, 'old')

      const suggestion = 'ing!\nIs hard!'
      manager.showCompletion(suggestion, 4, 'new')

      assert.isTrue(manager.hasSuggestion())
      assert.equal(source.value, 'test\n')
      assert.equal(source.selectionStart, 4)
      assert.equal(ghost.value, 'testing!\nIs hard!')
      assert.equal(ghost.scrollTop, source.scrollTop)
      assert.equal(manager.currentRawContext, 'new')
    })

    test('calls screen reader manager', () => {
      const screenReaderCompletion = spy(manager.screenReaderManager, 'receivedCompletion')
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4

      const suggestion = 'ing!'
      manager.showCompletion(suggestion, 4, 'context')
      assert(screenReaderCompletion.withArgs(suggestion, `${source.value}${suggestion}`).calledOnce)
    })
  })

  suite('acceptSuggestion', () => {
    test('basic acceptance', () => {
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4

      const suggestion = 'ing!'
      manager.showCompletion(suggestion, 4, 'context')
      manager.acceptSuggestion()

      assert.isFalse(manager.hasSuggestion())
      assert.equal(manager.currentRawContext, null)

      assert.equal(source.value, 'testing!')
      assert.equal(source.selectionStart, 8)
      assert.equal(ghost.value, '')
      assert.equal(ghost.scrollTop, source.scrollTop)
    })

    test('multi-line acceptance', () => {
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4

      const suggestion = 'ing!\nMatters!'
      manager.showCompletion(suggestion, 4, 'context')
      manager.acceptSuggestion()

      assert.isFalse(manager.hasSuggestion())
      assert.equal(manager.currentRawContext, null)

      assert.equal(source.value, 'testing!\nMatters!')
      assert.equal(source.selectionStart, 17)
      assert.equal(ghost.value, '')
      assert.equal(ghost.scrollTop, source.scrollTop)
    })
  })

  suite('cancelSuggestion', () => {
    test('no suggestion active', () => {
      ghost.value = 'test'
      const cancelled = manager.cancelSuggestion()
      assert.isFalse(cancelled)
      assert.equal(ghost.value, '')
    })

    test('basic cancellation', () => {
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4

      const suggestion = 'ing!'
      manager.showCompletion(suggestion, 4, 'context')
      const cancelled = manager.cancelSuggestion()

      assert.isTrue(cancelled)
      assert.isFalse(manager.hasSuggestion())
      assert.equal(source.value, 'test')
      assert.equal(source.selectionStart, 4)
      assert.equal(ghost.value, '')
      assert.equal(ghost.scrollTop, source.scrollTop)
    })

    test('multi-line cancellation', () => {
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4
      const suggestion = 'ing!\nMatters!'
      manager.showCompletion(suggestion, 4, 'context')
      const cancelled = manager.cancelSuggestion()

      assert.isTrue(cancelled)
      assert.isFalse(manager.hasSuggestion())
      assert.equal(source.value, 'test')
      assert.equal(source.selectionStart, 4)
      assert.equal(ghost.value, '')
      assert.equal(ghost.scrollTop, source.scrollTop)
    })

    test('calls screen reader manager', () => {
      const screenReaderClear = spy(manager.screenReaderManager, 'cancelSuggestion')
      source.value = 'test'
      source.selectionStart = source.selectionEnd = 4

      const suggestion = 'ing!'
      manager.showCompletion(suggestion, 4, 'context')
      manager.cancelSuggestion()

      assert(screenReaderClear.calledTwice)
    })
  })

  suite('noticeChanges', () => {
    test('our change does a full cancel', () => {
      source.value = 'test\ntest'
      manager.currentSuggestion = 'suggested'
      manager.originalSource = 'test'
      manager.alteredSource = source.value

      manager.noticeChange()
      assert.equal(source.value, 'test')
      assert.equal(source.selectionStart, 4)
      assert.equal(ghost.value, '')
      assert.equal(ghost.scrollTop, source.scrollTop)
      assert.equal(manager.currentSuggestion, null)
      assert.equal(manager.originalSource, null)
      assert.equal(manager.alteredSource, null)
    })

    test('external change, only drops ghost', () => {
      source.value = 'test\ntest'
      manager.currentSuggestion = 'suggested'
      manager.originalSource = 'test'
      manager.alteredSource = `${source.value} NOT US`

      manager.noticeChange()
      assert.equal(source.value, 'test\ntest')
      assert.equal(source.selectionStart, 9)
      assert.equal(ghost.value, '')
      assert.equal(ghost.scrollTop, source.scrollTop)
      assert.equal(manager.currentSuggestion, null)
      assert.equal(manager.originalSource, null)
      assert.equal(manager.alteredSource, null)
    })
  })

  suite('handleWordWrap', () => {
    setup(async function () {
      ruler = {
        // Count number of lines by sentences, this lets us mock the word wrap scenario by using a period in the suggestion.
        getNumberOfLines: (text: string) => text.split('.').length,
      }
      const screenReaderManager = new ScreenReaderManager(undefined, undefined, undefined)
      manager = new GhostManager(source, new GhostTextArea(ghost), ruler, screenReaderManager)
    })

    test('adds newline to source text when completion results in word wrap', () => {
      const prefix = 'Here is one sentence (and line). Here is another. Now lets test the end of a third sen'
      source.value = prefix
      manager.handleWordWrap(prefix, 'tence.', '', 3, 4, true)
      assert.equal(
        source.value,
        'Here is one sentence (and line). Here is another. Now lets test the end of a third\nsen',
      )
    })

    test('does not add a newline when suggestion does not result in word wrap', () => {
      const prefix = 'Here is one sentence (and line). Here is another. Now lets test the end of a third sen'
      source.value = prefix
      manager.handleWordWrap(prefix, "tence that isn't finished", '', 3, 3, true)
      assert.equal(source.value, prefix)
    })
  })
})
