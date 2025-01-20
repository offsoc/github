import {buildAssignee} from '../test-utils/AssigneePickerHelpers'
import {sortAssigneePickerUsers} from '../components/AssigneePickerUtils'
import type {Assignee} from '../components/AssigneePicker'

describe('sorting of items', () => {
  let assignedUsers: Assignee[]
  let searchResult: Assignee[]
  let sortedSearchResult: Assignee[]

  beforeEach(() => {
    assignedUsers = [
      buildAssignee({login: 'login8', name: 'name8'}),
      buildAssignee({login: 'login1', name: 'name1'}),
      buildAssignee({login: 'login3', name: 'name3'}),
    ] as Assignee[]

    searchResult = [
      buildAssignee({login: 'login7', name: 'name7'}),
      buildAssignee({login: 'login5', name: 'name5'}),
      buildAssignee({login: 'login6', name: 'name6'}),
    ] as Assignee[]

    sortedSearchResult = searchResult.slice().sort((a, b) => a.login.localeCompare(b.login))
  })

  test('does not include any assignees if they do not match the query', () => {
    const sorted = sortAssigneePickerUsers(assignedUsers, searchResult, 'noassignee')
    expect(sorted).toEqual(sortedSearchResult)
  })

  test('includes assignees if they match the query', () => {
    const sorted = sortAssigneePickerUsers(assignedUsers, searchResult, 'login1')
    expect(sorted).toEqual([assignedUsers[1], ...sortedSearchResult])
  })

  test('includes all the assignees that match the query', () => {
    const sorted = sortAssigneePickerUsers(assignedUsers, searchResult, 'login')
    expect(sorted).toEqual([...assignedUsers, ...sortedSearchResult])
  })

  test('does not render duplicate items if the result set contains assignees', () => {
    assignedUsers.push(searchResult[0]!) // add user name7 to the assignedUsers array

    const sorted = sortAssigneePickerUsers(assignedUsers, searchResult, '7')
    expect(sorted.map(u => u.login)).toEqual(['login7', 'login5', 'login6'])
  })

  test('does not render duplicate items if the result set contains more assignees', () => {
    searchResult.push(...assignedUsers)

    const sorted = sortAssigneePickerUsers(assignedUsers, searchResult, 'name')
    expect(sorted).toEqual([...assignedUsers, ...sortedSearchResult])
  })

  test('assignee filtering checkes either name or login', () => {
    let sorted = sortAssigneePickerUsers(assignedUsers, searchResult, 'name1')
    expect(sorted).toEqual([assignedUsers[1], ...sortedSearchResult])

    // Testing the case when login is concatenated with name
    sorted = sortAssigneePickerUsers(assignedUsers, searchResult, '1na')
    expect(sorted).toEqual(sortedSearchResult)
  })
})
