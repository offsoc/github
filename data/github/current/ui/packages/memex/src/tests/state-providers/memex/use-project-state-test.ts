import {renderHook} from '@testing-library/react'

import {useProjectState} from '../../../client/state-providers/memex/use-project-state'
import {EmptyMemex} from '../../../mocks/data/memexes'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {createOptionsWithProvider} from './helpers'

describe('useProjectState', () => {
  it('returns default data if no JSON island data found', () => {
    const {result} = renderHook(useProjectState, createOptionsWithProvider())

    expect(result.current.isClosed).toBeFalsy()
    expect(result.current.isPublicProject).toBeFalsy()
  })

  it('returns default data if JSON island contains empty project', () => {
    seedJSONIsland('memex-data', EmptyMemex)

    const {result} = renderHook(useProjectState, createOptionsWithProvider())

    expect(result.current.isClosed).toBeFalsy()
    expect(result.current.isPublicProject).toBeFalsy()
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

    const {result} = renderHook(useProjectState, createOptionsWithProvider())

    expect(result.current.isClosed).toBeTruthy()
    expect(result.current.isPublicProject).toBeTruthy()
  })
})
