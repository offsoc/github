import {threadContainsDiffHunks} from '../use-load-review-completion'
import {mockMessage, mockMessages} from './mocks'

test('Check that diffHunk exists in chat thread.', () => {
  const result = threadContainsDiffHunks(mockMessages)
  expect(result).toBe(true)
})

test('Check that diffHunk doesnt exists in chat thread', () => {
  const result = threadContainsDiffHunks([mockMessage])
  expect(result).toBe(false)
})
