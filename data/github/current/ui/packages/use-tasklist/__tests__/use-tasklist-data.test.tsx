import {render, renderHook} from '@testing-library/react'
import type {PropsWithChildren} from 'react'

import {type TasklistTestData, TaskListBuilder} from '../test-utils/TaskListBuilder'
import {useTasklistData} from '../use-tasklist-data'
import {getTaskListsFromContainer} from '../test-utils/helpers'

const renderTasklistBuilder = (list: TasklistTestData[]) => {
  const {container} = render(<TaskListBuilder list={list} />)
  const tasklists = getTaskListsFromContainer(container)

  return {container, tasklists}
}

test('plain text', () => {
  /*
    - [ ] 0.0 Regular text with funky symbols: `
      - [ ] 1.0 Regular nested text with funky symbols: `
  */
  const data: TasklistTestData[] = [
    {
      type: 'tasklistitem',
      title: '0.0 Regular text with funky symbols: `',
      children: [
        {
          type: 'tasklistitem',
          title: '1.0 Regular nested text with funky symbols: `',
        },
      ],
    },
  ]

  const {container, tasklists} = renderTasklistBuilder(data)

  const {result} = renderHook(() => useTasklistData(container, tasklists))
  const {tasklistData} = result.current

  const tasklistItems = Array.from(tasklistData.values()).flat()

  expect(tasklistItems).toHaveLength(2)

  expect(tasklistItems[0]?.title).toStrictEqual('0.0 Regular text with funky symbols: `')
  expect(tasklistItems[0]?.position).toStrictEqual([0, 0])

  expect(tasklistItems[1]?.title).toStrictEqual('1.0 Regular nested text with funky symbols: `')
  expect(tasklistItems[1]?.position).toStrictEqual([1, 0])
})

const Code = ({children}: PropsWithChildren) => <code className="notranslate">{children}</code>
test('code tag', () => {
  /*
    - [ ] 0.0 This has `code` in it
      - [ ] 1.0 This has `code` in it
    - [ ] 0.1 This has <code>code</code> in it
      - [ ] 2.0 This has <code>code</code> in it
    - [ ] 0.2 Complex code: <code><label>Enter your name: <input id="name" type="text" /></label></code>
      - [ ] 3.0 Complex code: <code><label>Enter your name: <input id="name" type="text" /></label></code>
  */
  const data: TasklistTestData[] = [
    {
      type: 'tasklistitem',
      title: '0.0 This has `code` in it',
      children: [
        {
          type: 'tasklistitem',
          title: (
            <>
              1.0 This has <Code>code</Code> in it
            </>
          ),
        },
      ],
    },
    {
      type: 'tasklistitem',
      title: (
        <>
          0.1 This has <Code>code</Code> in it
        </>
      ),
      children: [
        {
          type: 'tasklistitem',
          title: (
            <>
              2.0 This has <Code>code</Code> in it
            </>
          ),
        },
      ],
    },
    {
      type: 'tasklistitem',
      title: (
        <>
          0.2 Complex code: <Code>{`<label>Enter your name: <input id="name" type="text" /></label>`}</Code>
        </>
      ),
      children: [
        {
          type: 'tasklistitem',
          title: (
            <>
              3.0 Complex code: <Code>{`<label>Enter your name: <input id="name" type="text" /></label>`}</Code>
            </>
          ),
        },
      ],
    },
  ]

  const {container, tasklists} = renderTasklistBuilder(data)

  const {result} = renderHook(() => useTasklistData(container, tasklists))
  const {tasklistData} = result.current

  const tasklistItems = Array.from(tasklistData.values()).flat()

  expect(tasklistItems).toHaveLength(6)
  expect(tasklistItems[0]?.title).toBe('0.0 This has `code` in it')
  expect(tasklistItems[1]?.title).toBe('1.0 This has `code` in it')
  expect(tasklistItems[2]?.title).toBe('0.1 This has `code` in it')
  expect(tasklistItems[3]?.title).toBe('2.0 This has `code` in it')
  expect(tasklistItems[4]?.title).toBe(
    '0.2 Complex code: `<label>Enter your name: <input id="name" type="text" /></label>`',
  )
  expect(tasklistItems[5]?.title).toBe(
    '3.0 Complex code: `<label>Enter your name: <input id="name" type="text" /></label>`',
  )
})

const IssueReference = ({children}: PropsWithChildren) => (
  <span className="reference">
    <svg aria-hidden="true" />
    <a className="issue-link js-issue-link" href="https://github.localhost/monalisa/smile/issues/123">
      {children}
      <span className="issue-shorthand"> #123</span>
    </a>
  </span>
)
test('issue references', () => {
  /*
    - [ ] 0.0 Issue reference: #123
      - [ ] 1.0 Normal task
  */
  const data: TasklistTestData[] = [
    {
      type: 'tasklistitem',
      title: (
        <>
          <>0.0 Issue reference: </>
          <IssueReference>Issue title</IssueReference>
        </>
      ),
      children: [
        {
          type: 'tasklistitem',
          title: '1.0 Normal task',
        },
      ],
    },
  ]

  const {container, tasklists} = renderTasklistBuilder(data)

  const {result} = renderHook(() => useTasklistData(container, tasklists))
  const {tasklistData} = result.current

  const tasklistItems = Array.from(tasklistData.values()).flat()

  expect(tasklistItems).toHaveLength(2)
  expect(tasklistItems[0]?.title).toBe('0.0 Issue reference: Issue title #123')
  expect(tasklistItems[1]?.title).toBe('1.0 Normal task')
})

test('links', () => {
  /*
    - [ ] 0.0 https://github.com
      - [ ] 1.0 [Custom anchor text](https://github.com)
  */
  const data: TasklistTestData[] = [
    {
      type: 'tasklistitem',
      title: (
        <>
          <>0.0 </>
          <a href="https://github.com" rel="nofollow">
            https://github.com
          </a>
        </>
      ),
      children: [
        {
          type: 'tasklistitem',
          title: (
            <>
              <>1.0 </>
              <a href="https://github.com" rel="nofollow">
                Custom anchor text
              </a>
            </>
          ),
        },
      ],
    },
  ]

  const {container, tasklists} = renderTasklistBuilder(data)

  const {result} = renderHook(() => useTasklistData(container, tasklists))
  const {tasklistData} = result.current

  const tasklistItems = Array.from(tasklistData.values()).flat()

  expect(tasklistItems).toHaveLength(2)
  expect(tasklistItems[0]?.title).toBe('0.0 https://github.com')
  expect(tasklistItems[1]?.title).toBe('1.0 Custom anchor text')
})

test('regular lists without checkbox', () => {
  /*
    - 0.0 Regular list item
      - 1.0 Nested regular list item
  */

  const data: TasklistTestData[] = [
    {
      type: 'listitem',
      title: '0.0 Regular list item',
      children: [
        {
          type: 'listitem',
          title: '1.0 Nested regular list item',
        },
      ],
    },
  ]

  const {container, tasklists} = renderTasklistBuilder(data)

  const {result} = renderHook(() => useTasklistData(container, tasklists))
  const {tasklistData} = result.current

  const listItems = Array.from(tasklistData.values()).flat()

  expect(listItems).toHaveLength(2)
  // No tasklist items, only regular bullet points
  expect(listItems.filter(({isBullet}) => !isBullet)).toHaveLength(0)
})

test('mixed (tasklist + regular list)', () => {
  /*
    - 0.0 regular item
      - [ ] 1.0 task item
        - 2.0 regular item
          - 3.0 regular item
            - [ ] 4.0 task item
        - [ ] 2.1 task item
        - 2.2 regular item
          - 5.0 regular item
            - [ ] 6.0 task item
  */
  const data: TasklistTestData[] = [
    {
      type: 'listitem',
      title: '0.0 regular item',
      children: [
        {
          type: 'tasklistitem',
          title: '1.0 task item',
          children: [
            {
              type: 'listitem',
              title: '2.0 regular item',
              children: [
                {
                  type: 'listitem',
                  title: '3.0 regular item',
                  children: [
                    {
                      type: 'tasklistitem',
                      title: '4.0 task item',
                    },
                  ],
                },
              ],
            },
            {
              type: 'tasklistitem',
              title: '2.1 task item',
            },
            {
              type: 'listitem',
              title: '2.2 regular item',
              children: [
                {
                  type: 'listitem',
                  title: '5.0 regular item',
                  children: [
                    {
                      type: 'tasklistitem',
                      title: '6.0 task item',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ]

  const {container, tasklists} = renderTasklistBuilder(data)

  const {result} = renderHook(() => useTasklistData(container, tasklists))
  const {tasklistData} = result.current

  const listItems = Array.from(tasklistData.values()).flat()

  expect(listItems).toHaveLength(9)

  expect(listItems[0]?.title).toStrictEqual('0.0 regular item')
  expect(listItems[0]?.position).toBeUndefined()

  expect(listItems[1]?.title).toStrictEqual('1.0 task item')
  expect(listItems[1]?.position).toStrictEqual([1, 0])

  expect(listItems[2]?.title).toStrictEqual('2.0 regular item')
  expect(listItems[2]?.position).toBeUndefined()

  expect(listItems[3]?.title).toStrictEqual('3.0 regular item')
  expect(listItems[3]?.position).toBeUndefined()

  expect(listItems[4]?.title).toStrictEqual('4.0 task item')
  expect(listItems[4]?.position).toStrictEqual([4, 0])

  expect(listItems[5]?.title).toStrictEqual('2.1 task item')
  expect(listItems[5]?.position).toStrictEqual([2, 1])

  expect(listItems[6]?.title).toStrictEqual('2.2 regular item')
  expect(listItems[6]?.position).toBeUndefined()

  expect(listItems[7]?.title).toStrictEqual('5.0 regular item')
  expect(listItems[7]?.position).toBeUndefined()

  expect(listItems[8]?.title).toStrictEqual('6.0 task item')
  expect(listItems[8]?.position).toStrictEqual([6, 0])
})

test('HTML sanitizing', () => {
  /*
    - [ ] <div>0.0 <em>Wrapped</em> <strong>in</strong> a div</div>
      - [ ] 1.0 <div>
          <img alt="user avatar" src="https://avatars.githubusercontent.com/u/0" />
          <em>Chaotic</em> <div>use</div> <strong>of</strong>
          <div><span>H</span><span>T</span><span>M</span><span>L</span></div>
        </div>
  */
  const data: TasklistTestData[] = [
    {
      type: 'tasklistitem',
      title: (
        <div>
          0.0 <em>Wrapped</em> <strong>in</strong> a div
        </div>
      ),
      children: [
        {
          type: 'tasklistitem',
          title: (
            <>
              <>1.0 </>
              <div>
                <img alt="user avatar" src="https://avatars.githubusercontent.com/u/0" />
                <em>Chaotic</em> <div>use</div> <strong>of</strong>{' '}
                <div>
                  <span>H</span>
                  <span>T</span>
                  <span>M</span>
                  <span>L</span>
                </div>
              </div>
            </>
          ),
        },
      ],
    },
  ]

  const {container, tasklists} = renderTasklistBuilder(data)

  const {result} = renderHook(() => useTasklistData(container, tasklists))
  const {tasklistData} = result.current

  const tasklistItems = Array.from(tasklistData.values()).flat()

  expect(tasklistItems[0]?.title).toBe('0.0 Wrapped in a div')
  expect(tasklistItems[1]?.title).toBe('1.0 Chaotic use of HTML')
})
