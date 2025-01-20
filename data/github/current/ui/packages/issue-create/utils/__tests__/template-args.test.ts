import {BLANK_ISSUE} from '../model'
import {constructIssueCreateParams, getIssueCreateArguments, hasAnyInitialValues} from '../template-args'

function constructRepository(owner: string, name: string) {
  return {
    name,
    owner: {
      login: owner,
    },
  }
}

test('correct parses incoming template-args', () => {
  let args = getIssueCreateArguments(
    new URLSearchParams('org=test&repo=random-repo&template=bug_report&title=mytitle&body=mybody'),
  )
  expect(args).toEqual({
    repository: {
      name: 'random-repo',
      owner: 'test',
    },
    templateFileName: 'bug_report',
    initialValues: {
      title: 'mytitle',
      body: 'mybody',
    },
  })

  args = getIssueCreateArguments(new URLSearchParams('title=test'))
  expect(args).toEqual({
    templateFileName: BLANK_ISSUE,
    initialValues: {
      title: 'test',
    },
  })

  args = getIssueCreateArguments(new URLSearchParams(''))
  expect(args).toEqual(undefined)
  expect(args?.initialValues).toEqual(undefined)
})

test('correctly detects an initial value', () => {
  expect(
    hasAnyInitialValues({
      title: 'test',
    }),
  ).toBe(true)

  expect(
    hasAnyInitialValues({
      title: 'test',
      body: 'test',
    }),
  ).toBe(true)

  expect(hasAnyInitialValues({})).toBe(false)
  expect(hasAnyInitialValues(undefined)).toBe(false)

  expect(
    hasAnyInitialValues({
      labels: [],
    }),
  ).toBe(true)

  expect(
    hasAnyInitialValues({
      assignees: [],
    }),
  ).toBe(true)

  expect(
    hasAnyInitialValues({
      projects: [],
    }),
  ).toBe(true)
})

test('correctly constructs template-args', () => {
  expect(
    constructIssueCreateParams({
      includeRepository: true,
      repository: constructRepository('test', 'random_repo'),
      title: 'goodtitle',
      body: 'goodbody',
    }),
  ).toBe('org=test&repo=random_repo&title=goodtitle&body=goodbody')

  expect(
    constructIssueCreateParams({
      includeRepository: true,
      repository: constructRepository('testowner', 'test'),
      title: 'test',
      body: '',
      templateFileName: 'testtemplate',
    }),
  ).toBe('org=testowner&repo=test&template=testtemplate&title=test&body=')

  expect(
    constructIssueCreateParams({
      includeRepository: true,
      repository: constructRepository('owner', 'test'),
    }),
  ).toBe('org=owner&repo=test')

  expect(
    constructIssueCreateParams({
      includeRepository: true,
      repository: undefined,
    }),
  ).toBe('')

  expect(
    constructIssueCreateParams({
      includeRepository: false,
      repository: constructRepository('testowner', 'test'),
    }),
  ).toBe('')

  expect(
    constructIssueCreateParams({
      includeRepository: true,
      repository: constructRepository('owner', 'test'),
      title: 'title',
      body: 'body',
      templateFileName: 'test',
    }),
  ).toBe('org=owner&repo=test&template=test&title=title&body=body')
})
