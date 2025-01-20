import {renderHook} from '@testing-library/react'

import {useProjectNumber} from '../../../client/state-providers/memex/use-project-number'
import {EmptyMemex} from '../../../mocks/data/memexes'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {createOptionsWithProvider} from './helpers'

describe('useProjectNumber', () => {
  it('returns default data if no JSON island data found', () => {
    const {result} = renderHook(useProjectNumber, createOptionsWithProvider())

    expect(result.current.projectNumber).toEqual(-1)
  })

  it('returns default data if JSON island contains empty project', () => {
    seedJSONIsland('memex-data', EmptyMemex)

    const {result} = renderHook(useProjectNumber, createOptionsWithProvider())

    expect(result.current.projectNumber).toEqual(100)
  })

  it('returns expected data if JSON island contains existing project', () => {
    const InitialProjectData = {
      id: 200,
      number: 400,
      title: 'My Cool Memex',
      public: true,
      closedAt: '2022-10-10',
      isTemplate: false,
    }

    seedJSONIsland('memex-data', InitialProjectData)

    const {result} = renderHook(useProjectNumber, createOptionsWithProvider())

    expect(result.current.projectNumber).toEqual(InitialProjectData.number)
  })
})
