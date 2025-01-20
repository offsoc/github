import {addDays, addWeeks, format, parseISO} from 'date-fns'

import type {Iteration, IterationConfiguration} from '../../client/api/columns/contracts/iteration'
import {
  buildBreak,
  doesBreakExist,
  getCustomIterationFromToken,
  getLatestIteration,
  intervalAsRangeSelection,
  intervalDatesDescription,
  intervalDurationDescription,
  isCurrentIteration,
  IterationToken,
  partitionAllIterations,
} from '../../client/helpers/iterations'
import {IterationColumnModel} from '../../client/models/column-model/custom/iteration'
import {customColumnFactory} from '../factories/columns/custom-column-factory'

describe('getLatestIteration', () => {
  it('returns null when no iterations found', () => {
    const configuration: IterationConfiguration = {
      startDay: 0,
      duration: 14,
      iterations: [],
      completedIterations: [],
    }
    expect(getLatestIteration(configuration)).toBeNull()
  })

  it('returns latest iteration when completed and active iterations present', () => {
    const completedIteration = {
      id: 'completed',
      title: 'Completed',
      titleHtml: 'Completed',
      startDate: '2021-09-09', // Sept 09 - Sept 22
      duration: 14,
    }
    const firstIteration = {
      id: 'first',
      title: 'First',
      titleHtml: 'First',
      startDate: '2021-09-23', // Sept 23 - Oct 06
      duration: 14,
    }
    const latestIteration = {
      id: 'next',
      title: 'Second',
      titleHtml: 'Second',
      startDate: '2021-10-07', // Oct 07 - Oct 20
      duration: 14,
    }

    const configuration: IterationConfiguration = {
      startDay: 0,
      duration: 14,
      iterations: [latestIteration, firstIteration],
      completedIterations: [completedIteration],
    }
    expect(getLatestIteration(configuration)).toBe(latestIteration)
  })

  it('returns expected iteration when active iterations out of order', () => {
    const firstIteration = {
      id: 'first',
      title: 'First',
      titleHtml: 'First',
      startDate: '2021-09-23', // Sept 23 - Oct 06
      duration: 14,
    }
    const nextIteration = {
      id: 'next',
      title: 'Second',
      titleHtml: 'Second',
      startDate: '2021-10-07', // Oct 07 - Oct 20
      duration: 14,
    }
    const configuration: IterationConfiguration = {
      startDay: 0,
      duration: 14,
      iterations: [nextIteration, firstIteration],
      completedIterations: [],
    }
    expect(getLatestIteration(configuration)).toBe(nextIteration)
  })

  it('returns expected iteration when completed iterations out of order', () => {
    const firstIteration = {
      id: 'first',
      title: 'First',
      titleHtml: 'First',
      startDate: '2021-09-23', // Sept 23 - Oct 06
      duration: 14,
    }
    const nextIteration = {
      id: 'next',
      title: 'Second',
      titleHtml: 'Second',
      startDate: '2021-10-07', // Oct 07 - Oct 20
      duration: 14,
    }

    const configuration: IterationConfiguration = {
      startDay: 0,
      duration: 14,
      iterations: [],
      completedIterations: [firstIteration, nextIteration],
    }
    expect(getLatestIteration(configuration)).toBe(nextIteration)
  })

  describe('isCurrentIteration', () => {
    it('computes correct date range', () => {
      const aWednesday = new Date(2021, 9, 13, 9) // 6th October 2021, 9am local
      const previousIteration = {
        id: 'previous',
        title: 'First',
        titleHtml: 'First',
        startDate: '2021-09-23', // Sept 23 - Oct 06
        duration: 14,
      }
      const currentIteration = {
        id: 'current',
        title: 'Second',
        titleHtml: 'Second',
        startDate: '2021-10-07', // Oct 07 - Oct 20
        duration: 14,
      }
      const nextIteration = {
        id: 'next',
        title: 'Third',
        titleHtml: 'Third',
        startDate: '2021-10-21', // Oct 21 - Nov 3
        duration: 14,
      }
      expect(isCurrentIteration(aWednesday, previousIteration)).toBeFalsy()
      expect(isCurrentIteration(aWednesday, currentIteration)).toBeTruthy()
      expect(isCurrentIteration(aWednesday, nextIteration)).toBeFalsy()
    })
  })
})

describe('intervalAsRangeSelection', () => {
  describe('given a valid iteration', () => {
    const rangeSelection = intervalAsRangeSelection({
      id: 'test-iteration',
      titleHtml: 'Test Iteration',
      startDate: '2021-10-07',
      duration: 14,
      title: 'Test Iteration',
    } as Iteration)

    it('is defined', () => expect(rangeSelection).toBeDefined())

    it('starts on start date', () => expect(rangeSelection?.from.toString()).toEqual(parseISO('2021-10-07').toString()))

    it('has defined "to" date', () => expect(rangeSelection?.to).toBeDefined())

    it('ends on start date + duration, where duration includes both the start and end days', () =>
      expect(rangeSelection?.to?.toString()).toEqual(parseISO('2021-10-20').toString()))
  })
})

describe('doesBreakExist', () => {
  const firstIteration = {
    id: 'first',
    title: 'First',
    titleHtml: 'First',
    startDate: '2021-09-23', // Sept 23 - Oct 06
    duration: 14,
  }
  const secondIteration = {
    id: 'next',
    title: 'Second',
    titleHtml: 'Second',
    startDate: '2021-10-07', // Oct 07 - Oct 20
    duration: 14,
  }

  const thirdIteration = {
    id: 'next',
    title: 'Second',
    titleHtml: 'Second',
    startDate: '2021-10-22', // Oct 22 - Nov 5
    duration: 14,
  }

  it('returns false if there is no gap between consecutive iterations', () => {
    expect(doesBreakExist(firstIteration, secondIteration)).toBeFalsy()
  })

  it('returns true if there is a gap between consecutive iterations', () => {
    expect(doesBreakExist(secondIteration, thirdIteration)).toBeTruthy()
  })
})

describe('buildBreak', () => {
  const firstIteration = {
    id: 'first',
    title: 'First',
    titleHtml: 'First',
    startDate: '2021-09-23', // Sept 23 - Oct 06
    duration: 14,
  }
  const secondIteration = {
    id: 'next',
    title: 'Second',
    titleHtml: 'Second',
    startDate: '2021-10-07', // Oct 07 - Oct 20
    duration: 14,
  }

  const thirdIteration = {
    id: 'next',
    title: 'Second',
    titleHtml: 'Second',
    startDate: '2021-10-22', // Oct 22 - Nov 5
    duration: 14,
  }
  it('returns an IterationBreak object with the right interval if a break exists', () => {
    const iterationBreak = buildBreak(secondIteration, thirdIteration)
    expect(iterationBreak).toBeDefined()
    expect(iterationBreak!.startDate).toEqual('2021-10-21')
    expect(iterationBreak!.duration).toEqual(1)
  })

  it('returns undefined if a break does not exist between consecutive iterations', () => {
    const iterationBreak = buildBreak(firstIteration, secondIteration)
    expect(iterationBreak).toBeUndefined()
  })

  it('returns undefined if previousIteration is undefined', () => {
    const iterationBreak = buildBreak(undefined, secondIteration)
    expect(iterationBreak).toBeUndefined()
  })

  it('returns undefined if nextIteration is undefined', () => {
    const iterationBreak = buildBreak(firstIteration, undefined)
    expect(iterationBreak).toBeUndefined()
  })
})

describe('intervalDatesDescription', () => {
  it('returns the interval as a human readable string', () => {
    expect(
      intervalDatesDescription({
        startDate: '2021-10-22',
        duration: 14,
      }),
    ).toEqual('Oct 22, 2021 - Nov 04, 2021')
  })

  it('returns an empty string if the start date is empty', () => {
    expect(
      intervalDatesDescription({
        startDate: '',
        duration: 14,
      }),
    ).toEqual('')
  })

  it('returns an empty string if the interval is undefined', () => {
    expect(intervalDatesDescription(undefined)).toEqual('')
  })
})

describe('intervalDurationDescription', () => {
  it('returns the interval duration as a human readable string', () => {
    expect(
      intervalDurationDescription({
        startDate: '2021-10-22',
        duration: 2,
      }),
    ).toEqual('2 days')
  })

  it('correctly pluralizes the duration', () => {
    expect(
      intervalDurationDescription({
        startDate: '2021-10-22',
        duration: 1,
      }),
    ).toEqual('1 day')
  })

  it('returns an empty string if the interval is  undefined', () => {
    expect(intervalDurationDescription(undefined)).toEqual('')
  })
})

describe('partitionAllIterations', () => {
  const dateFormat = 'yyyy-MM-dd'
  const today = new Date()

  it('returns only sorted completed iterations', () => {
    const twoWeeksAgo = {
      id: 'twoWeeksAgo',
      title: 'twoWeeksAgo',
      titleHtml: 'twoWeeksAgo',
      startDate: format(addWeeks(today, -2), dateFormat),
      duration: 14,
    }
    const fourWeeksAgo = {
      id: 'fourWeeksAgo',
      title: 'fourWeeksAgo',
      titleHtml: 'fourWeeksAgo',
      startDate: format(addWeeks(today, -4), dateFormat),
      duration: 14,
    }
    const sixWeeksAgo = {
      id: 'sixWeeksAgo',
      title: 'sixWeeksAgo',
      titleHtml: 'sixWeeksAgo',
      startDate: format(addWeeks(today, -6), dateFormat),
      duration: 14,
    }

    const iterations = [twoWeeksAgo, sixWeeksAgo, fourWeeksAgo]

    const partitionedIterations = partitionAllIterations(iterations)
    expect(partitionedIterations['completedIterations']).toStrictEqual([twoWeeksAgo, fourWeeksAgo, sixWeeksAgo])
  })

  it('returns only sorted active iterations', () => {
    const current = {
      id: 'current',
      title: 'current',
      titleHtml: 'current',
      startDate: format(today, dateFormat),
      duration: 14,
    }
    const inTwoWeeks = {
      id: 'inTwoWeeks',
      title: 'inTwoWeeks',
      titleHtml: 'inTwoWeeks',
      startDate: format(addWeeks(today, 2), dateFormat),
      duration: 14,
    }
    const inFourWeeks = {
      id: 'inFourWeeks',
      title: 'inFourWeeks',
      titleHtml: 'inFourWeeks',
      startDate: format(addWeeks(today, 4), dateFormat),
      duration: 14,
    }

    const iterations = [inTwoWeeks, current, inFourWeeks]

    const partitionedIterations = partitionAllIterations(iterations)
    expect(partitionedIterations['iterations']).toStrictEqual([current, inTwoWeeks, inFourWeeks])
  })

  it('returns sorted active and completed iterations', () => {
    const twoWeeksAgo = {
      id: 'twoWeeksAgo',
      title: 'twoWeeksAgo',
      titleHtml: 'twoWeeksAgo',
      startDate: format(addWeeks(today, -2), dateFormat),
      duration: 14,
    }
    const fourWeeksAgo = {
      id: 'fourWeeksAgo',
      title: 'fourWeeksAgo',
      titleHtml: 'fourWeeksAgo',
      startDate: format(addWeeks(today, -4), dateFormat),
      duration: 14,
    }
    const current = {
      id: 'current',
      title: 'current',
      titleHtml: 'current',
      startDate: format(today, dateFormat),
      duration: 14,
    }
    const inTwoWeeks = {
      id: 'inTwoWeeks',
      title: 'inTwoWeeks',
      titleHtml: 'inTwoWeeks',
      startDate: format(addWeeks(today, 2), dateFormat),
      duration: 14,
    }
    const inFourWeeks = {
      id: 'inFourWeeks',
      title: 'inFourWeeks',
      titleHtml: 'inFourWeeks',
      startDate: format(addWeeks(today, 4), dateFormat),
      duration: 14,
    }

    const iterations = [inFourWeeks, inTwoWeeks, fourWeeksAgo, twoWeeksAgo, current]

    const partitionedIterations = partitionAllIterations(iterations)

    const expected = {
      iterations: [current, inTwoWeeks, inFourWeeks],
      completedIterations: [twoWeeksAgo, fourWeeksAgo],
    }
    expect(partitionedIterations).toStrictEqual(expected)
  })
})

describe('getCustomIterationFromToken', () => {
  const dateFormat = 'yyyy-MM-dd'
  const today = new Date()
  const yesterday = addDays(today, -1)
  const tomorrow = addDays(today, 1)

  it('returns correct next iteration when in a break', () => {
    const firstIteration = {
      id: 'first',
      title: 'First',
      titleHtml: 'First',
      startDate: format(addWeeks(today, 1), dateFormat),
      duration: 14,
    }

    const configuration: IterationConfiguration = {
      startDay: 0,
      duration: 14,
      iterations: [firstIteration],
      completedIterations: [],
    }

    const column = customColumnFactory
      .iteration({
        configuration,
      })
      .build({name: 'Iteration'})
    const columnModel = new IterationColumnModel(column)

    expect(getCustomIterationFromToken(IterationToken.Next, columnModel)).toBe(firstIteration)
  })

  it('returns current when iteration is in iterations', () => {
    // An iteration representing a single day - today
    const iteration = {
      id: 'first',
      title: 'First',
      titleHtml: 'First',
      startDate: format(today, dateFormat),
      duration: 1,
    }

    const configuration: IterationConfiguration = {
      startDay: 0,
      duration: 1,
      iterations: [iteration],
      completedIterations: [],
    }

    const column = customColumnFactory
      .iteration({
        configuration,
      })
      .build({name: 'Iteration'})
    const columnModel = new IterationColumnModel(column)

    // Confirm that the iteration for today is the current one
    expect(getCustomIterationFromToken(IterationToken.Current, columnModel)).toBe(iteration)
  })

  it('returns previous, current, next when iteration is in completedIterations', () => {
    // An iteration representing a single day - yesterday
    const previousIteration = {
      id: 'first',
      title: 'First',
      titleHtml: 'First',
      startDate: format(yesterday, dateFormat),
      duration: 1,
    }

    // An iteration representing a single day - today
    const currentIteration = {
      id: 'second',
      title: 'Second',
      titleHtml: 'Second',
      startDate: format(today, dateFormat),
      duration: 1,
    }

    // An iteration representing a single day - tomorrow
    const nextIteration = {
      id: 'third',
      title: 'Third',
      titleHtml: 'Third',
      startDate: format(tomorrow, dateFormat),
      duration: 1,
    }

    // Place the current iteration in completedIterations to represent the
    // fact that the server controls whether or not the iteration is completed
    // but we still want it to show up as the current iteration for users.
    const configuration: IterationConfiguration = {
      startDay: 0,
      duration: 1,
      iterations: [nextIteration],
      completedIterations: [previousIteration, currentIteration],
    }

    const column = customColumnFactory
      .iteration({
        configuration,
      })
      .build({name: 'Iteration'})
    const columnModel = new IterationColumnModel(column)

    // Confirm that the iteration for tomorrow is the next one
    expect(getCustomIterationFromToken(IterationToken.Previous, columnModel)).toBe(previousIteration)
    expect(getCustomIterationFromToken(IterationToken.Current, columnModel)).toBe(currentIteration)
    expect(getCustomIterationFromToken(IterationToken.Next, columnModel)).toBe(nextIteration)
  })
})
