import {act, renderHook} from '@testing-library/react'

import {useProjectDetails} from '../../../client/state-providers/memex/use-project-details'
import {EmptyMemex} from '../../../mocks/data/memexes'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {createOptionsWithProvider} from './helpers'

describe('useProjectDetails', () => {
  it('returns default data if no JSON island data found', () => {
    const {result} = renderHook(useProjectDetails, createOptionsWithProvider())

    expect(result.current.title).toEqual('Untitled project')
    expect(result.current.description).toEqual('')
    expect(result.current.shortDescription).toEqual('')
    expect(result.current.descriptionHtml).toEqual('')
  })

  it('returns title derived from memex-creator if found', () => {
    seedJSONIsland('memex-creator', {
      login: 'shiftkey',
      name: 'Brendan',
      id: 1234,
      global_relay_id: 'MDQ6VXNl',
      avatarUrl: 'https://github.com/shiftkey.png',
      isSpammy: false,
    })

    const {result} = renderHook(useProjectDetails, createOptionsWithProvider())

    expect(result.current.title).toEqual("@shiftkey's untitled project")
  })

  it('returns default data if JSON island contains empty project', () => {
    seedJSONIsland('memex-data', EmptyMemex)

    const {result} = renderHook(useProjectDetails, createOptionsWithProvider())

    expect(result.current.title).toEqual('Untitled project')
    expect(result.current.titleHtml).toEqual('Untitled project')
    expect(result.current.description).toEqual('')
    expect(result.current.shortDescription).toEqual('')
    expect(result.current.descriptionHtml).toEqual('')
  })

  it('returns expected data if JSON island contains existing project', () => {
    const InitialProjectData = {
      id: 200,
      number: 400,
      title: 'My `Cool` Memex',
      titleHtml: 'My <code>Cool</code> Memex',
      description: 'This is a project',
      shortDescription: 'A short project description',
      public: true,
      closedAt: '2022-10-10',
      isTemplate: false,
    }

    seedJSONIsland('memex-data', InitialProjectData)

    const {result} = renderHook(useProjectDetails, createOptionsWithProvider())

    expect(result.current.title).toEqual(InitialProjectData.title)
    expect(result.current.titleHtml).toEqual(InitialProjectData.titleHtml)
    expect(result.current.description).toEqual(InitialProjectData.description)
    expect(result.current.shortDescription).toEqual(InitialProjectData.shortDescription)
    expect(result.current.descriptionHtml).toEqual('')
  })

  describe('descriptionHtml', () => {
    it('is empty by default', () => {
      const {result} = renderHook(useProjectDetails, createOptionsWithProvider())

      expect(result.current.descriptionHtml).toBe('')
    })

    it('can update value in context provider', () => {
      const {result} = renderHook(useProjectDetails, createOptionsWithProvider())

      const newDescription = 'some new description'

      act(() => {
        result.current.setDescriptionHtml(newDescription)
      })

      expect(result.current.descriptionHtml).toBe(newDescription)
    })
  })
})
