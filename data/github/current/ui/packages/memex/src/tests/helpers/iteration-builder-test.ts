import {addDays, subDays} from 'date-fns'

import type {IterationConfiguration, IterationInterval} from '../../client/api/columns/contracts/iteration'
import {
  appendNewIteration,
  createInitialIterations,
  removeIteration,
  updateBreak,
  updateIteration,
} from '../../client/helpers/iteration-builder'
import {
  adjustDuration,
  adjustStartDate,
  dayAfterIntervalEnds,
  formatFullDate,
  type IterationDuration,
} from '../../client/helpers/iterations'

describe('iteration builder', () => {
  describe('createInitialIterations', () => {
    const startDate = new Date()

    it('returns empty array when count is zero', () => {
      const settings = {
        selectedStartDate: startDate,
        duration: 14,
      }
      expect(createInitialIterations('title', settings, 0)).toMatchObject({
        iterations: [],
        completedIterations: [],
      })
    })

    it('returns iteration matching expected format', () => {
      const settings = {
        selectedStartDate: startDate,
        duration: 14,
      }

      expect(createInitialIterations('Iteration', settings, 1)).toMatchObject({
        iterations: [{duration: 14, startDate: formatFullDate(startDate), title: 'Iteration 1'}],
        completedIterations: [],
      })
    })

    it('returns two iterations matching expected format', () => {
      const settings = {
        selectedStartDate: startDate,
        duration: 14,
      }

      expect(createInitialIterations('Iteration', settings, 2)).toMatchObject({
        iterations: [
          {duration: 14, startDate: formatFullDate(startDate), title: 'Iteration 1'},
          {duration: 14, startDate: formatFullDate(addDays(startDate, 14)), title: 'Iteration 2'},
        ],
        completedIterations: [],
      })
    })

    it('returns completed iterations as well as current and next iterations when some iterations have already passed', () => {
      const settings = {
        selectedStartDate: addDays(startDate, -28),
        duration: 14,
      }
      expect(createInitialIterations('Iteration', settings, 4)).toMatchObject({
        completedIterations: [
          {duration: 14, startDate: formatFullDate(addDays(startDate, -14)), title: 'Iteration 2'},
          {duration: 14, startDate: formatFullDate(addDays(startDate, -28)), title: 'Iteration 1'},
        ],
        iterations: [
          {duration: 14, startDate: formatFullDate(startDate), title: 'Iteration 3'},
          {duration: 14, startDate: formatFullDate(addDays(startDate, 14)), title: 'Iteration 4'},
        ],
      })
    })

    it('creates iterations with correct names when a number is present in iteration field title', () => {
      const settings = {
        selectedStartDate: startDate,
        duration: 14,
      }

      const expectedIteration1 = {
        duration: 14,
        startDate: formatFullDate(startDate),
        title: 'Iteration 7 1',
      }
      const expectedIteration2 = {
        duration: 14,
        startDate: formatFullDate(addDays(startDate, 14)),
        title: 'Iteration 7 2',
      }
      const expectedIteration3 = {
        duration: 14,
        startDate: formatFullDate(addDays(startDate, 28)),
        title: 'Iteration 7 3',
      }

      expect(createInitialIterations('Iteration 7', settings, 3)).toMatchObject({
        completedIterations: [],
        iterations: [expectedIteration1, expectedIteration2, expectedIteration3],
      })
    })

    describe('error cases', () => {
      it('throws when title is empty', () => {
        const settings = {
          selectedStartDate: startDate,
          duration: 14,
        }
        expect(() => createInitialIterations('', settings, 0)).toThrow()
      })

      it('throws when count is less than zero', () => {
        const settings = {
          selectedStartDate: startDate,
          duration: 14,
        }
        expect(() => createInitialIterations('title', settings, -1)).toThrow()
      })
    })
  })

  describe('appendNewIteration', () => {
    it('creates a new iteration from today when no planned iterations exist and start day matches', () => {
      const today = new Date()
      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [],
        completedIterations: [],
      }

      expect(appendNewIteration(configuration, 'Iteration', today)).toMatchObject({
        iterations: [
          {
            id: '',
            title: 'Iteration 1',
            titleHtml: 'Iteration 1',
            startDate: formatFullDate(today),
            duration: 14,
          },
        ],
        completedIterations: [],
      })
    })

    it('uses last planned iteration number to compute value', () => {
      const today = new Date()
      const firstIteration = {
        id: 'iteration-7',
        title: 'Iteration 7',
        startDate: formatFullDate(today),
        titleHtml: 'Iteration 7',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: 1,
        duration: 14,
        iterations: [firstIteration],
        completedIterations: [],
      }

      expect(appendNewIteration(configuration, 'Sprint', addDays(today, 14))).toMatchObject({
        iterations: [
          firstIteration,
          {
            id: '',
            title: 'Sprint 8',
            titleHtml: 'Sprint 8',
            startDate: formatFullDate(addDays(today, 14)),
            duration: 14,
          },
        ],
        completedIterations: [],
      })
    })

    it('uses number of iterations if last one lacks anything like a number', () => {
      const today = new Date()
      const firstIteration = {
        id: 'iteration-7',
        title: 'Iteration 7',
        startDate: formatFullDate(today),
        titleHtml: 'Iteration 7',
        duration: 14,
      }
      const secondIteration = {
        id: '',
        title: 'Cool Down Week',
        startDate: formatFullDate(addDays(today, 14)),
        titleHtml: 'Cool Down Week',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [firstIteration, secondIteration],
        completedIterations: [],
      }

      expect(appendNewIteration(configuration, 'Sprint', addDays(today, 28))).toMatchObject({
        iterations: [
          firstIteration,
          secondIteration,
          {
            id: '',
            title: 'Sprint 3',
            titleHtml: 'Sprint 3',
            startDate: formatFullDate(addDays(today, 28)),
            duration: 14,
          },
        ],
        completedIterations: [],
      })
    })

    it('creates the correct title on appending when there is a number present in the iteration title', () => {
      const today = new Date()
      const firstIteration = {
        id: 'iteration-7',
        title: 'Iteration 7 1',
        startDate: formatFullDate(today),
        titleHtml: 'Iteration 7 1',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [firstIteration],
        completedIterations: [],
      }

      const expectedSecondIteration = {
        id: '',
        title: 'Iteration 7 2',
        titleHtml: 'Iteration 7 2',
        startDate: formatFullDate(addDays(today, 28)),
        duration: 14,
      }

      expect(appendNewIteration(configuration, 'Iteration 7', addDays(today, 28))).toMatchObject({
        iterations: [firstIteration, expectedSecondIteration],
        completedIterations: [],
      })
    })

    it('creates the correct title when there is a number present in the iteration title but last iteration has different name than field name', () => {
      const today = new Date()
      const firstIteration = {
        id: 'iteration-7',
        title: 'Iteration 7 1',
        startDate: formatFullDate(today),
        titleHtml: 'Iteration 7 1',
        duration: 14,
      }
      const secondIteration = {
        id: 'random-21',
        title: 'Random 21',
        startDate: formatFullDate(addDays(today, 14)),
        titleHtml: 'Random 21',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [firstIteration, secondIteration],
        completedIterations: [],
      }

      const expectedThirdIteration = {
        id: '',
        title: 'Iteration 7 22',
        titleHtml: 'Iteration 7 22',
        startDate: formatFullDate(addDays(today, 28)),
        duration: 14,
      }

      expect(appendNewIteration(configuration, 'Iteration 7', addDays(today, 28))).toMatchObject({
        iterations: [firstIteration, secondIteration, expectedThirdIteration],
        completedIterations: [],
      })
    })

    it('append the correct iteration when no start date is provided', () => {
      const today = new Date()
      const firstIteration = {
        id: 'sprint-1',
        title: 'Sprint 1',
        startDate: formatFullDate(today),
        titleHtml: 'Sprint 1',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [firstIteration],
        completedIterations: [],
      }

      const expectedSecondIteration = {
        id: '',
        title: 'Sprint 2',
        titleHtml: 'Sprint 2',
        startDate: formatFullDate(addDays(today, 14)),
        duration: 14,
      }

      expect(appendNewIteration(configuration, 'Sprint')).toMatchObject({
        iterations: [firstIteration, expectedSecondIteration],
        completedIterations: [],
      })
    })

    it('applies duration override when provided', () => {
      const today = new Date()
      const firstIteration = {
        id: 'sprint-1',
        title: 'Sprint 1',
        startDate: formatFullDate(today),
        titleHtml: 'Sprint 1',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [firstIteration],
        completedIterations: [],
      }

      const duration: IterationDuration = {
        quantity: 50,
        units: 'days',
      }

      const startDate = addDays(today, 14)

      const expectedSecondIteration = {
        id: '',
        title: 'Sprint 2',
        titleHtml: 'Sprint 2',
        startDate: formatFullDate(startDate),
        duration: 50,
      }

      expect(appendNewIteration(configuration, 'Sprint', startDate, duration)).toMatchObject({
        iterations: [firstIteration, expectedSecondIteration],
        completedIterations: [],
        duration: 50,
      })
    })

    it('uses empty string for ID if no overrideId is specified', () => {
      const today = new Date()
      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [],
        completedIterations: [],
      }

      expect(appendNewIteration(configuration, 'Iteration', today).iterations?.[0].id).toBe('')
    })

    it('applies override ID if specified', () => {
      const today = new Date()
      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [],
        completedIterations: [],
      }

      expect(appendNewIteration(configuration, 'Iteration', today, undefined, 'override_id').iterations?.[0].id).toBe(
        'override_id',
      )
    })
  })

  describe('removeIteration', () => {
    const today = new Date()
    it('removes an active iteration', () => {
      const firstIteration = {
        id: 'iteration-7',
        title: 'Iteration 7',
        startDate: formatFullDate(today),
        titleHtml: 'Iteration 7',
        duration: 14,
      }
      const secondIteration = {
        id: 'cool-down-week',
        title: 'Cool Down Week',
        startDate: formatFullDate(addDays(today, 14)),
        titleHtml: 'Cool Down Week',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [firstIteration, secondIteration],
        completedIterations: [],
      }

      expect(removeIteration(configuration, secondIteration)).toMatchObject({
        iterations: [
          {
            id: 'iteration-7',
            title: 'Iteration 7',
            startDate: formatFullDate(today),
            duration: 14,
          },
        ],
      })
    })

    it('removes a completed iteration', () => {
      const firstIteration = {
        id: 'iteration-7',
        title: 'Iteration 7',
        startDate: formatFullDate(today),
        titleHtml: 'Iteration 7',
        duration: 14,
      }
      const secondIteration = {
        id: 'cool-down-week',
        title: 'Cool Down Week',
        startDate: formatFullDate(addDays(today, 14)),
        titleHtml: 'Cool Down Week',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: today.getDay() === 0 ? 7 : today.getDay(),
        duration: 14,
        iterations: [],
        completedIterations: [firstIteration, secondIteration],
      }

      expect(removeIteration(configuration, secondIteration)).toMatchObject({
        completedIterations: [
          {
            id: 'iteration-7',
            title: 'Iteration 7',
            startDate: formatFullDate(today),
            duration: 14,
          },
        ],
      })
    })

    it('does not change dates of iterations after removed entry', () => {
      const firstIteration = {
        id: 'iteration-7',
        title: 'Iteration 7',
        startDate: formatFullDate(today),
        titleHtml: 'Iteration 7',
        duration: 14,
      }
      const secondIteration = {
        id: 'cool-down-week',
        title: 'Cool Down Week',
        startDate: formatFullDate(addDays(today, 14)),
        titleHtml: 'Cool Down Week',
        duration: 14,
      }
      const thirdIteration = {
        id: 'iteration-8',
        title: 'Iteration 8',
        startDate: formatFullDate(addDays(today, 28)),
        titleHtml: 'Iteration 8',
        duration: 14,
      }

      const configuration: IterationConfiguration = {
        startDay: 1,
        duration: 14,
        iterations: [firstIteration, secondIteration, thirdIteration],
        completedIterations: [],
      }

      expect(removeIteration(configuration, secondIteration)).toMatchObject({
        iterations: [firstIteration, thirdIteration],
      })
    })
  })

  describe('updateIteration', () => {
    const today = new Date()

    const originalConfig: IterationConfiguration = {
      duration: 5,
      startDay: today.getDay(),
      completedIterations: [
        {
          id: 'b',
          title: 'Iteration 2',
          titleHtml: 'Iteration 2',
          startDate: formatFullDate(subDays(today, 5)),
          duration: 5,
        },
        {
          id: 'a',
          title: 'Iteration 1',
          titleHtml: 'Iteration 1',
          startDate: formatFullDate(subDays(today, 10)),
          duration: 5,
        },
      ],
      iterations: [
        {
          id: 'c',
          title: 'Iteration 3',
          titleHtml: 'Iteration 3',
          startDate: formatFullDate(today),
          duration: 5,
        },
        {
          id: 'd',
          title: 'Iteration 4',
          titleHtml: 'Iteration 4',
          startDate: formatFullDate(addDays(today, 5)),
          duration: 5,
        },
        {
          id: 'e',
          title: 'Iteration 5',
          titleHtml: 'Iteration 5',
          startDate: formatFullDate(addDays(today, 15)),
          duration: 5,
        },
      ],
    }

    it('performs no change if the updated iteration is not found', () =>
      expect(
        updateIteration(originalConfig, {
          id: 'x',
          title: 'Iteration 0',
          titleHtml: 'Iteration 0',
          startDate: formatFullDate(today),
          duration: 5,
        }),
      ).toMatchObject({}))

    it('renames an iteration without changing any dates', () => {
      const updated1 = {
        ...originalConfig.completedIterations[1],
        title: 'Iteration A',
      }

      const expectedConfig = {
        iterations: originalConfig.iterations,
        completedIterations: [originalConfig.completedIterations[0], updated1],
      }

      expect(updateIteration(originalConfig, updated1)).toMatchObject(expectedConfig)
    })

    it('changes dates without pushing iterations if there is no overlap', () => {
      const updated3 = {
        ...originalConfig.iterations[0],
        duration: 3,
      }

      const expectedConfig = {
        completedIterations: originalConfig.completedIterations,
        iterations: [updated3, originalConfig.iterations[1], originalConfig.iterations[2]],
      }

      expect(updateIteration(originalConfig, updated3)).toMatchObject(expectedConfig)
    })

    it('pushes following iteration if there is overlap, while shrinking breaks', () => {
      const updated3 = {
        ...originalConfig.iterations[0],
        duration: 7,
      }

      const expectedConfig = {
        completedIterations: originalConfig.completedIterations,
        iterations: [updated3, adjustStartDate(originalConfig.iterations[1], 2), originalConfig.iterations[2]],
      }

      expect(updateIteration(originalConfig, updated3)).toMatchObject(expectedConfig)
    })

    it('pushes following iterations if there is overlap, eliminating breaks if pushed enough', () => {
      const updated3 = {
        ...originalConfig.iterations[0],
        duration: 15,
      }

      const expectedConfig = {
        completedIterations: originalConfig.completedIterations,
        iterations: [
          updated3,
          adjustStartDate(originalConfig.iterations[1], 10),
          adjustStartDate(originalConfig.iterations[2], 5),
        ],
      }

      expect(updateIteration(originalConfig, updated3)).toMatchObject(expectedConfig)
    })

    it('moves iteration into active array if it becomes active', () => {
      const updated2 = {
        ...originalConfig.completedIterations[0],
        duration: 10,
      }

      const expectedConfig = {
        completedIterations: [originalConfig.completedIterations[1]],
        iterations: [
          updated2,
          adjustStartDate(originalConfig.iterations[0], 5),
          adjustStartDate(originalConfig.iterations[1], 5),
          originalConfig.iterations[2],
        ],
      }

      expect(updateIteration(originalConfig, updated2)).toMatchObject(expectedConfig)
    })
  })
})

describe('updateBreak', () => {
  const today = new Date()
  const originalConfig: IterationConfiguration = {
    duration: 5,
    startDay: today.getDay(),
    completedIterations: [
      {
        id: 'b',
        title: 'Iteration 2',
        titleHtml: 'Iteration 2',
        startDate: formatFullDate(subDays(today, 5)),
        duration: 5,
      },
      {
        id: 'a',
        title: 'Iteration 1',
        titleHtml: 'Iteration 1',
        startDate: formatFullDate(subDays(today, 10)),
        duration: 5,
      },
    ],
    iterations: [
      {
        id: 'c',
        title: 'Iteration 3',
        titleHtml: 'Iteration 3',
        startDate: formatFullDate(today),
        duration: 5,
      },
      {
        id: 'd',
        title: 'Iteration 4',
        titleHtml: 'Iteration 4',
        startDate: formatFullDate(addDays(today, 5)),
        duration: 5,
      },
      {
        id: 'e',
        title: 'Iteration 5',
        titleHtml: 'Iteration 5',
        startDate: formatFullDate(addDays(today, 15)),
        duration: 5,
      },
    ],
  }

  it('pushes iterations forward starting from `fromIteration` onwards if the break is extended', () => {
    const newBreak: IterationInterval = {
      startDate: formatFullDate(dayAfterIntervalEnds(originalConfig.iterations[1])),
      duration: 7,
    }

    const updates = updateBreak(originalConfig, originalConfig.iterations[1], originalConfig.iterations[2], newBreak)

    // Expect each iteration from `nextIteration`(inclusive) to be pushed forward by 2 days
    const expectedConfig = {
      completedIterations: originalConfig.completedIterations,
      iterations: [
        originalConfig.iterations[0],
        originalConfig.iterations[1],
        adjustStartDate(originalConfig.iterations[2], 2),
      ],
    }
    expect(updates).toMatchObject(expectedConfig)
  })

  it('pulls iterations back starting from `nextIteration` onwards if the amount is negative', () => {
    const newBreak: IterationInterval = {
      startDate: formatFullDate(dayAfterIntervalEnds(originalConfig.iterations[1])),
      duration: 3,
    }

    const updates = updateBreak(originalConfig, originalConfig.iterations[1], originalConfig.iterations[2], newBreak)

    const expectedConfig = {
      completedIterations: originalConfig.completedIterations,
      iterations: [
        originalConfig.iterations[0],
        originalConfig.iterations[1],
        adjustStartDate(originalConfig.iterations[2], -2),
      ],
    }
    expect(updates).toMatchObject(expectedConfig)
  })

  it('extends the previous iteration if the break start date is moved forward', () => {
    const newBreak: IterationInterval = {
      startDate: formatFullDate(addDays(dayAfterIntervalEnds(originalConfig.iterations[1]), 1)),
      duration: 4,
    }

    const updates = updateBreak(originalConfig, originalConfig.iterations[1], originalConfig.iterations[2], newBreak)

    const expectedConfig = {
      completedIterations: originalConfig.completedIterations,
      iterations: [
        originalConfig.iterations[0],
        adjustDuration(originalConfig.iterations[1], 1),
        originalConfig.iterations[2],
      ],
    }
    expect(updates).toMatchObject(expectedConfig)
  })

  it('shortens the previous iteration if the break start date is moved backwards', () => {
    const newBreak: IterationInterval = {
      startDate: formatFullDate(subDays(dayAfterIntervalEnds(originalConfig.iterations[1]), 1)),
      duration: 6,
    }

    const updates = updateBreak(originalConfig, originalConfig.iterations[1], originalConfig.iterations[2], newBreak)

    const expectedConfig = {
      completedIterations: originalConfig.completedIterations,
      iterations: [
        originalConfig.iterations[0],
        adjustDuration(originalConfig.iterations[1], -1),
        originalConfig.iterations[2],
      ],
    }
    expect(updates).toMatchObject(expectedConfig)
  })
})
