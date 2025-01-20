import {labelsCounterText} from '../labels'

test('returns correct text for one label', () => {
  const text = labelsCounterText([{text: 'bug', id: 'bug-id'}])
  expect(text).toEqual('bug')
})

test('returns correct text truncated for one long label', () => {
  const text = labelsCounterText([{text: 'long long long long long long ...', id: 'long-id'}])
  expect(text).toEqual('long long long long long long ...')
})

test('returns correct text for two labels', () => {
  const text = labelsCounterText([
    {text: 'bug', id: 'bug-id'},
    {text: 'good first issue', id: 'good-first-issue-id'},
  ])
  expect(text).toEqual('bug, good first issue')
})

test('returns correct text truncated for two long labels', () => {
  const text = labelsCounterText([
    {text: 'bug', id: 'bug-id'},
    {text: 'good first issue issue issue', id: 'good-first-issue-id'},
  ])
  expect(text).toEqual('bug, good first issue issue is...')
})

test('returns correct text for one long label and one short', () => {
  const text = labelsCounterText([
    {text: 'good first issue issue issue', id: 'good-first-issue-id'},
    {text: 'bug', id: 'bug-id'},
  ])
  expect(text).toEqual('good first issue issue is... +1 more')
})

test('returns correct text for one 25 chars label and one short', () => {
  const text = labelsCounterText([
    {text: 'good first issue issue is', id: 'good-first-issue-id'},
    {text: 'bug', id: 'bug-id'},
  ])
  expect(text).toEqual('good first issue issue is, bug')
})

test('returns correct text for more than two labels', () => {
  const text = labelsCounterText([
    {text: 'bug', id: 'bug-id'},
    {text: 'good first issue', id: 'good-first-issue-id'},
    {text: 'epic', id: 'epic-id'},
  ])
  expect(text).toEqual('bug, good first issue, epic')
})

test('returns correct text for multiple labels', () => {
  const text = labelsCounterText([
    {text: 'bug', id: 'bug-id'},
    {text: 'good first issue', id: 'good-first-issue-id'},
    {text: 'epic', id: 'epic-id'},
    {text: 'other label', id: 'other-id'},
  ])
  expect(text).toEqual('bug, good first issue, epic +1 more')
})

test('returns correct text for multiple long labels', () => {
  const text = labelsCounterText([
    {text: 'bug bug bug', id: 'bug-id'},
    {text: 'good first issue', id: 'good-first-issue-id'},
    {text: 'epic', id: 'epic-id'},
    {text: 'other label', id: 'other-id'},
  ])
  expect(text).toEqual('bug bug bug, good first issue... +2 more')
})

test('returns correct text for no labels', () => {
  const text = labelsCounterText([])
  expect(text).toEqual('All')
})

test('returns correct text truncated if there are long labels', () => {
  const text = labelsCounterText([
    {text: 'bug', id: 'bug-id'},
    {text: 'long long long long long long long long label', id: 'long-id'},
  ])
  expect(text).toEqual('bug, long long long long long ...')
})
