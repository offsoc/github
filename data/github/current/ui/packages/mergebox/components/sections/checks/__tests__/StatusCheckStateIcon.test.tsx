import {buildSectionsData} from '../StatusCheckStatesIcon'
import type {CheckStateRollup} from '../../../../page-data/payloads/status-checks'

describe('buildSectionsData fn', () => {
  test('check counts are sectioned in the correct order: SUCCESS, SKIPPED, PENDING, FAILURE', () => {
    const statusRollupSummary: CheckStateRollup[] = [
      {count: 1, state: 'FAILURE'},
      {count: 1, state: 'PENDING'},
      {count: 1, state: 'SKIPPED'},
      {count: 1, state: 'SUCCESS'},
    ]

    const sections = buildSectionsData(statusRollupSummary)
    expect(sections).toHaveLength(4)
    expect(sections[0]?.name).toBe('SUCCESS')
    expect(sections[1]?.name).toBe('SKIPPED')
    expect(sections[2]?.name).toBe('PENDING')
    expect(sections[3]?.name).toBe('FAILURE')
  })

  test('correctly sets percentage, dashArray, transform and stroke settings for each section with gap percentages accounted for', () => {
    const statusRollupSummary: CheckStateRollup[] = [
      // 8 Failure states
      {count: 3, state: 'FAILURE'},
      {count: 1, state: 'CANCELLED'},
      {count: 1, state: 'STALE'},
      {count: 1, state: 'STARTUP_FAILURE'},
      {count: 1, state: 'TIMED_OUT'},
      {count: 1, state: 'ERROR'},
      // 8 Pending states
      {count: 1, state: 'PENDING'},
      {count: 1, state: 'EXPECTED'},
      {count: 1, state: 'QUEUED'},
      {count: 1, state: 'WAITING'},
      {count: 1, state: '_UNKNOWN_VALUE'},
      {count: 1, state: 'IN_PROGRESS'},
      {count: 1, state: 'REQUESTED'},
      {count: 1, state: 'ACTION_REQUIRED'},
      // 2 Skipped state
      {count: 1, state: 'SKIPPED'},
      {count: 1, state: 'NEUTRAL'},
      // 2 Success states
      {count: 1, state: 'SUCCESS'},
      {count: 1, state: 'COMPLETED'},
    ]

    const sections = buildSectionsData(statusRollupSummary)
    const [successSection, skippedSection, pendingSection, failureSection] = sections

    // As there are 4 sections, we expect for 20% of the percentages to be filled with visual gaps.
    // The remaining 80% will be used by these sections.
    expect(successSection?.percentage).toBe(5)
    expect(skippedSection?.percentage).toBe(5)
    expect(pendingSection?.percentage).toBe(35)
    expect(failureSection?.percentage).toBe(35)
    // Assert 80% percent usage to account for the 20% gap percentage.
    expect(sections.reduce((acc, section) => acc + section.percentage, 0)).toEqual(80)

    expect(successSection?.dashArray).toBe('13.82300767579509 276.46015351590177')
    expect(skippedSection?.dashArray).toBe('13.82300767579509 276.46015351590177')
    expect(pendingSection?.dashArray).toBe('96.76105373056562 276.46015351590177')
    expect(failureSection?.dashArray).toBe('96.76105373056562 276.46015351590177')

    expect(successSection?.transform).toBe('rotate(-81deg)')
    expect(skippedSection?.transform).toBe('rotate(-45deg)')
    expect(pendingSection?.transform).toBe('rotate(-9deg)')
    expect(failureSection?.transform).toBe('rotate(135deg)')

    expect(successSection?.stroke).toBe('var(--fgColor-success)')
    expect(skippedSection?.stroke).toBe('var(--fgColor-neutral)')
    expect(pendingSection?.stroke).toBe('var(--fgColor-attention)')
    expect(failureSection?.stroke).toBe('var(--fgColor-danger)')
  })

  describe('4 sections', () => {
    test('correctly adds additional percentage to all check sections that fall below 6% (before removing gap percentage) and adds back 5%', () => {
      const statusRollupSummary: CheckStateRollup[] = [
        // 82.03% of total count
        {count: 8203, state: 'FAILURE'},
        // 5.99% of total count
        {count: 599, state: 'PENDING'},
        // 5.99% of total count
        {count: 599, state: 'SKIPPED'},
        // 5.99% of total count
        {count: 599, state: 'SUCCESS'},
      ]

      const sections = buildSectionsData(statusRollupSummary)
      const [successSection, skippedSection, pendingSection, failureSection] = sections

      // As there are 4 sections, we expect for 20% of the perecentages to be filled with visual gaps.
      // The remaining 80% will be used by these sections.
      expect(successSection?.percentage).toBe(5.99)
      expect(skippedSection?.percentage).toBe(5.99)
      expect(pendingSection?.percentage).toBe(5.99)
      // It only removes the additional 20% gap from the largest section.
      expect(failureSection?.percentage).toBe(62.03)
      // Assert 80% percent usage to account for the 20% gap percentage.
      expect(sections.reduce((acc, section) => acc + section.percentage, 0)).toEqual(80)
    })
  })

  describe('3 sections', () => {
    test('correctly adds additional percentage to all check sections that fall below 6% (before removing gap percentage) and adds back 5%', () => {
      const statusRollupSummary: CheckStateRollup[] = [
        // 88.02% of total count
        {count: 8802, state: 'FAILURE'},
        // 5.99% of total count
        {count: 599, state: 'PENDING'},
        // 5.99% of total count
        {count: 599, state: 'SKIPPED'},
      ]

      const sections = buildSectionsData(statusRollupSummary)
      const [skippedSection, pendingSection, failureSection] = sections

      // As there are 3 sections, we expect for 15% of the perecentages to be filled with visual gaps.
      // The remaining 85% will be used by these sections.
      expect(skippedSection?.percentage).toBe(5.99)
      expect(pendingSection?.percentage).toBe(5.99)
      // Assert it removed the additional 15% gap from the largest section.
      expect(failureSection?.percentage).toBe(73.02)
      // Assert 85% percent usage to account for the 15% gap percentage.
      expect(sections.reduce((acc, section) => acc + section.percentage, 0)).toEqual(85)
    })
  })

  describe('2 sections', () => {
    test('correctly adds additional percentage to all check sections that fall below 6% (before removing gap percentage) and adds back 5%', () => {
      const statusRollupSummary: CheckStateRollup[] = [
        // 94.01% of total count
        {count: 9401, state: 'FAILURE'},
        // 5.99% of total count
        {count: 599, state: 'PENDING'},
      ]

      const sections = buildSectionsData(statusRollupSummary)
      const [pendingSection, failureSection] = sections

      // As there are 2 sections, we expect for 10% of the perecentages to be filled with visual gaps.
      // The remaining 90% will be used by these sections.
      expect(pendingSection?.percentage).toBe(5.99)
      // Assert it removed the additional 15% gap from the largest section.
      expect(failureSection?.percentage).toBe(84.01)
      // Assert 90% percent usage to account for the 10% gap percentage.
      expect(sections.reduce((acc, section) => acc + section.percentage, 0)).toEqual(90)
    })
  })

  describe('1 section', () => {
    test('Adds no gap percentage, so that we render an entire full circle', () => {
      const statusRollupSummary: CheckStateRollup[] = [{count: 1, state: 'PENDING'}]

      const sections = buildSectionsData(statusRollupSummary)
      const [pendingSection] = sections

      expect(pendingSection?.percentage).toBe(100)
    })
  })
})
