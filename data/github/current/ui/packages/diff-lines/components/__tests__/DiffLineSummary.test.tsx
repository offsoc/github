import {render, screen} from '@testing-library/react'

import DiffLineScreenReaderSummary, {buildDiffLineScreenReaderSummary} from '../DiffLineScreenReaderSummary'
import {buildComment, buildDiffLine, buildThread} from '../../test-utils/query-data'

describe('DiffLineSummary', () => {
  const thread1 = buildThread({
    comments: [
      buildComment({
        author: {login: 'thread1', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4', url: '/monalisa'},
      }),
    ],
  })
  const thread2 = buildThread({
    comments: [
      buildComment({
        author: {login: 'thread2', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4', url: '/monalisa'},
      }),
    ],
  })
  const thread3 = buildThread({
    comments: [
      buildComment({
        author: {login: 'thread3', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4', url: '/monalisa'},
      }),
    ],
  })
  const thread4 = buildThread({
    comments: [
      buildComment({
        author: {login: 'thread4', avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4', url: '/monalisa'},
      }),
    ],
  })

  describe('on the original line', () => {
    test('when the original (left line) and modified (right line) have no conversations, it is empty', () => {
      const leftLine = buildDiffLine({threads: []})
      const rightLine = buildDiffLine({threads: []})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.queryByTestId('pr-diffline-summary')).not.toBeInTheDocument()
    })

    test('when the original (left line) and modified (right line) both have conversations, it announces both have conversations', () => {
      const leftLine = buildDiffLine({threads: [thread1, thread2]})
      const rightLine = buildDiffLine({threads: [thread3, thread4]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Has conversations. Modified line has conversations.',
      )
    })

    test('when the original (left line) and modified (right line) both have one conversation, it announces the author of the conversation for each line', () => {
      const leftLine = buildDiffLine({threads: [thread1]})
      const rightLine = buildDiffLine({threads: [thread2]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Has conversation started by @thread1. Modified line has conversation started by @thread2.',
      )
    })

    test('when the original (left line) has no conversations and modified (right line) has one conversation, it announces the author of the conversation', () => {
      const leftLine = buildDiffLine({threads: []})
      const rightLine = buildDiffLine({threads: [thread1]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Modified line has conversation started by @thread1.',
      )
    })

    test('when the original (left line) has one conversation and modified (right line) has no conversations, it announces the author of the conversation', () => {
      const leftLine = buildDiffLine({threads: [thread1]})
      const rightLine = buildDiffLine({threads: []})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe('Has conversation started by @thread1.')
    })

    test('when the original (left line) has multiple conversations and modified (right line) has no conversations, it indicates the original line has conversations', () => {
      const leftLine = buildDiffLine({threads: [thread1, thread2]})
      const rightLine = buildDiffLine({threads: []})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe('Has conversations.')
    })

    test('when the original (left line) has no conversations and modified (right line) has multiple conversations, it indicates the modified line has conversations', () => {
      const leftLine = buildDiffLine({threads: []})
      const rightLine = buildDiffLine({threads: [thread1, thread2]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe('Modified line has conversations.')
    })

    test('when the original (left line) has one conversation and modified (right line) has multiple conversations, it announces the author of the original conversation and indicates the modified line has conversations', () => {
      const leftLine = buildDiffLine({threads: [thread1]})
      const rightLine = buildDiffLine({threads: [thread2, thread3]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Has conversation started by @thread1. Modified line has conversations.',
      )
    })

    test('when the original (left line) has multiple conversations and modified (right line) has one conversation, it indicates original line has conversations and announces the author of the conversation of the modified line', () => {
      const leftLine = buildDiffLine({threads: [thread1, thread2]})
      const rightLine = buildDiffLine({threads: [thread3]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'LEFT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Has conversations. Modified line has conversation started by @thread3.',
      )
    })
  })

  describe('on modified line', () => {
    test('when the original (left line) and modified (right line) have no conversations, it is empty', () => {
      const leftLine = buildDiffLine({threads: []})
      const rightLine = buildDiffLine({threads: []})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.queryByTestId('pr-diffline-summary')).not.toBeInTheDocument()
    })

    test('when the original (left line) and modified (right line) both have conversations, it announces both have conversations', () => {
      const leftLine = buildDiffLine({threads: [thread1, thread2]})
      const rightLine = buildDiffLine({threads: [thread3, thread4]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Has conversations. Original line has conversations.',
      )
    })

    test('when the original (left line) and modified (right line) both have one conversation, it announces the author of the conversation for each line', () => {
      const leftLine = buildDiffLine({threads: [thread1]})
      const rightLine = buildDiffLine({threads: [thread2]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Has conversation started by @thread2. Original line has conversation started by @thread1.',
      )
    })

    test('when the original (left line) has no conversations and modified (right line) has one conversation, it announces the author of the conversation', () => {
      const leftLine = buildDiffLine({threads: []})
      const rightLine = buildDiffLine({threads: [thread1]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe('Has conversation started by @thread1.')
    })

    test('when the original (left line) has one conversation and modified (right line) has no conversations, it announces the author of the conversation', () => {
      const leftLine = buildDiffLine({threads: [thread1]})
      const rightLine = buildDiffLine({threads: []})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Original line has conversation started by @thread1.',
      )
    })

    test('when the original (left line) has multiple conversations and modified (right line) has no conversations, it indicates the original line has conversations', () => {
      const leftLine = buildDiffLine({threads: [thread1, thread2]})
      const rightLine = buildDiffLine({threads: []})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe('Original line has conversations.')
    })

    test('when the original (left line) has no conversations and modified (right line) has multiple conversations, it indicates the modified line has conversations', () => {
      const leftLine = buildDiffLine({threads: []})
      const rightLine = buildDiffLine({threads: [thread1, thread2]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe('Has conversations.')
    })

    test('when the original (left line) has one conversation and modified (right line) has multiple conversations, it announces the author of the original conversation and indicates the modified line has conversations', () => {
      const leftLine = buildDiffLine({threads: [thread1]})
      const rightLine = buildDiffLine({threads: [thread2, thread3]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Has conversations. Original line has conversation started by @thread1.',
      )
    })

    test('when the original (left line) has multiple conversations and modified (right line) has one conversation, it indicates original line has conversations and announces the author of the conversation of the modified line', () => {
      const leftLine = buildDiffLine({threads: [thread1, thread2]})
      const rightLine = buildDiffLine({threads: [thread3]})
      const summary = buildDiffLineScreenReaderSummary(leftLine, rightLine, 'RIGHT')

      render(<DiffLineScreenReaderSummary summary={summary ?? ''} />)
      expect(screen.getByTestId('pr-diffline-summary').textContent).toBe(
        'Has conversation started by @thread3. Original line has conversations.',
      )
    })
  })
})
