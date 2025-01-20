import {groupChecks} from '../status-check-helpers'

describe('groupChecks function', () => {
  test('groups checks with the provided mapping', () => {
    const grouping = {
      SUCCESS: ['SUCCESS', 'SKIPPED'],
      FAILURE: ['FAILURE', 'STALE', 'CANCELLED'],
    }

    const checks = ['SUCCESS', 'SUCCESS', 'SKIPPED', 'FAILURE', 'STALE', 'FAILURE', 'CANCELLED', 'STALE']
    const getState = (state: string) => state

    const groups = groupChecks(checks, grouping, getState)
    expect(Object.keys(groups).length).toBe(2)
    expect(groups['SUCCESS']?.length).toBe(3)
    expect(groups['FAILURE']?.length).toBe(5)
    expect(groups['SUCCESS']?.filter(item => item === 'SUCCESS').length).toBe(2)
    expect(groups['SUCCESS']?.filter(item => item === 'SKIPPED').length).toBe(1)
    expect(groups['FAILURE']?.filter(item => item === 'FAILURE').length).toBe(2)
    expect(groups['FAILURE']?.filter(item => item === 'CANCELLED').length).toBe(1)
    expect(groups['FAILURE']?.filter(item => item === 'STALE').length).toBe(2)
  })

  test('group order is determined by the provided mapping', () => {
    const grouping = {
      SUCCESS: ['SUCCESS', 'SKIPPED'],
      FAILURE: ['FAILURE', 'STALE', 'CANCELLED'],
    }

    const checks = ['FAILURE', 'STALE', 'FAILURE', 'CANCELLED', 'STALE', 'SUCCESS', 'SUCCESS', 'SKIPPED']
    const getState = (state: string) => state

    const groups = groupChecks(checks, grouping, getState)
    expect(Object.keys(groups).length).toBe(2)
    expect(Object.keys(groups)[0]).toBe('SUCCESS')
    expect(Object.keys(groups)[1]).toBe('FAILURE')
  })
})
