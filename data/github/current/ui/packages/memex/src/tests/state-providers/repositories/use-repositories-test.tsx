import {act, renderHook} from '@testing-library/react'

import type {SuggestedRepository} from '../../../client/api/repository/contracts'
import {ProjectNumberContext} from '../../../client/state-providers/memex/memex-state-provider'
import {
  FETCH_REPOS_CACHE_TIMEOUT,
  RepositoriesStateProvider,
} from '../../../client/state-providers/repositories/repositories-state-provider'
import {useRepositories} from '../../../client/state-providers/repositories/use-repositories'
import {stubGetRepositories} from '../../mocks/api/repositories'
import {existingProject} from '../memex/helpers'

const firstRepository: SuggestedRepository = {
  createdAt: new Date(),
  lastInteractionAt: new Date(),
  name: 'some-repo',
  nameWithOwner: 'owner/some-repo',
  pushedAt: new Date(),
  isPublic: true,
  isForked: false,
  isArchived: false,
  hasIssues: true,
  id: 13456,
  url: 'https://github.com/owner/some-repo',
}

const secondRepository: SuggestedRepository = {
  createdAt: new Date(),
  lastInteractionAt: new Date(),
  name: 'another-repo',
  nameWithOwner: 'owner/another-repo',
  pushedAt: new Date(),
  isPublic: false,
  isForked: false,
  isArchived: false,
  hasIssues: true,
  id: 242424,
  url: 'https://github.com/owner/another-repo',
}

jest.mock('../../../client/api/repository/api-get-repositories')

describe('useRepositories', () => {
  function createWrapper() {
    const wrapper: React.ComponentType<React.PropsWithChildren<unknown>> = ({children}) => (
      <ProjectNumberContext.Provider value={existingProject()}>
        <RepositoriesStateProvider>{children}</RepositoriesStateProvider>
      </ProjectNumberContext.Provider>
    )

    return wrapper
  }

  it('no initial repositories loaded', () => {
    const wrapper = createWrapper()

    const {result} = renderHook(() => useRepositories(), {wrapper})

    expect(result.current.repositoriesCache.current.default.repositories).toHaveLength(0)
  })

  it('can fetch repositories and sees values in cache', async () => {
    stubGetRepositories([firstRepository, secondRepository])

    const wrapper = createWrapper()

    const {result} = renderHook(() => useRepositories(), {wrapper})

    await act(async () => {
      await result.current.suggestRepositories()
    })

    expect(result.current.repositoriesCache.current.default.repositories).toHaveLength(2)
  })

  it('can fetch repos with issue types only', async () => {
    const stub = stubGetRepositories([firstRepository, secondRepository])
    const wrapper = createWrapper()

    const {result} = renderHook(() => useRepositories(), {wrapper})

    await act(async () => {
      await result.current.suggestRepositories({onlyWithIssueTypes: true})
    })

    expect(stub).toHaveBeenCalledWith({memexNumber: existingProject().projectNumber, onlyWithIssueTypes: true})
    expect(result.current.repositoriesCache.current.withIssueTypes.repositories).toHaveLength(2)
  })

  it('can fetch repos with milestone only', async () => {
    const stub = stubGetRepositories([firstRepository, secondRepository])
    const wrapper = createWrapper()

    const {result} = renderHook(() => useRepositories(), {wrapper})

    await act(async () => {
      await result.current.suggestRepositories({milestone: 'M1'})
    })

    expect(stub).toHaveBeenCalledWith({
      memexNumber: existingProject().projectNumber,
      milestone: 'M1',
      onlyWithIssueTypes: false,
    })
    expect(result.current.repositoriesCache.current['milestone: M1'].repositories).toHaveLength(2)
  })

  it('fetching repositories is cached if before expiration', async () => {
    jest.useFakeTimers({doNotFake: ['queueMicrotask']})

    const getRepositories = stubGetRepositories([firstRepository, secondRepository])

    const wrapper = createWrapper()

    const {result} = renderHook(() => useRepositories(), {wrapper})

    const start = new Date().getTime()
    jest.setSystemTime(start)

    await act(async () => {
      // first time calling -> not cached -> API call
      await result.current.suggestRepositories()
      expect(getRepositories).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      // another call at same time with issue types -> not cached -> API call
      await result.current.suggestRepositories({onlyWithIssueTypes: true})
      expect(getRepositories).toHaveBeenCalledTimes(2)
    })

    await act(async () => {
      // another call at same time with first milestone -> not cached -> API call
      await result.current.suggestRepositories({milestone: 'M1'})
      expect(getRepositories).toHaveBeenCalledTimes(3)
    })

    await act(async () => {
      // another call at same time with second milestone -> not cached -> API call
      await result.current.suggestRepositories({milestone: 'M2'})
      expect(getRepositories).toHaveBeenCalledTimes(4)
    })

    const timeBeforeCacheExpired = start + FETCH_REPOS_CACHE_TIMEOUT / 1.5
    jest.setSystemTime(timeBeforeCacheExpired)

    await act(async () => {
      // next call, still before timeout -> cached -> no API call
      await result.current.suggestRepositories()
      expect(getRepositories).toHaveBeenCalledTimes(4)
    })

    await act(async () => {
      // next call with issue types, still before timeout -> cached -> no API call
      await result.current.suggestRepositories({onlyWithIssueTypes: true})
      expect(getRepositories).toHaveBeenCalledTimes(4)
    })

    await act(async () => {
      // next call with first milestone, still before timeout -> cached -> no API call
      await result.current.suggestRepositories({milestone: 'M1'})
      expect(getRepositories).toHaveBeenCalledTimes(4)
    })

    await act(async () => {
      // next call with second milestone, still before timeout -> cached -> no API call
      await result.current.suggestRepositories({milestone: 'M2'})
      expect(getRepositories).toHaveBeenCalledTimes(4)
    })

    const timeAfterCacheExpired = timeBeforeCacheExpired + FETCH_REPOS_CACHE_TIMEOUT / 1.5
    jest.setSystemTime(timeAfterCacheExpired)

    await act(async () => {
      // next call, after timeout -> cached -> API call
      await result.current.suggestRepositories()
      expect(getRepositories).toHaveBeenCalledTimes(5)
    })

    await act(async () => {
      // another call at same time -> cached -> no API call
      await result.current.suggestRepositories()
      expect(getRepositories).toHaveBeenCalledTimes(5)
    })

    await act(async () => {
      // next call with issue types, after timeout -> cached -> API call
      await result.current.suggestRepositories({onlyWithIssueTypes: true})
      expect(getRepositories).toHaveBeenCalledTimes(6)
    })

    await act(async () => {
      // another call with issue types at same time -> cached -> no API call
      await result.current.suggestRepositories({onlyWithIssueTypes: true})
      expect(getRepositories).toHaveBeenCalledTimes(6)
    })

    await act(async () => {
      // next call with first milestone, after timeout -> cached -> API call
      await result.current.suggestRepositories({milestone: 'M1'})
      expect(getRepositories).toHaveBeenCalledTimes(7)
    })

    await act(async () => {
      // another call with first milestone at same time -> cached -> no API call
      await result.current.suggestRepositories({milestone: 'M1'})
      expect(getRepositories).toHaveBeenCalledTimes(7)
    })
    await act(async () => {
      // next call with second milestone, after timeout -> cached -> API call
      await result.current.suggestRepositories({milestone: 'M2'})
      expect(getRepositories).toHaveBeenCalledTimes(8)
    })

    await act(async () => {
      // another call with second milestone at same time -> cached -> no API call
      await result.current.suggestRepositories({milestone: 'M2'})
      expect(getRepositories).toHaveBeenCalledTimes(8)
    })
  })

  describe('clearCachedSuggestions', () => {
    it('fetching repositories is not cached after clearing timeout', async () => {
      jest.useFakeTimers({doNotFake: ['queueMicrotask']})
      const getRepositories = stubGetRepositories([firstRepository, secondRepository])
      const wrapper = createWrapper()
      const {result} = renderHook(() => useRepositories(), {wrapper})
      const start = new Date().getTime()
      jest.setSystemTime(start)

      // initial calls to set the cache
      await act(async () => {
        // first time calling -> not cached -> API call
        await result.current.suggestRepositories()
        expect(getRepositories).toHaveBeenCalledTimes(1)
      })

      await act(async () => {
        // first time calling with issue types -> not cached -> API call
        await result.current.suggestRepositories({onlyWithIssueTypes: true})
        expect(getRepositories).toHaveBeenCalledTimes(2)
      })

      // confirm behavior before invalidating cache
      await act(async () => {
        // another call at same time -> cached -> no API call
        await result.current.suggestRepositories()
        expect(getRepositories).toHaveBeenCalledTimes(2)
      })

      await act(async () => {
        // another call at same time with issue types -> cached -> no API call
        await result.current.suggestRepositories({onlyWithIssueTypes: true})
        expect(getRepositories).toHaveBeenCalledTimes(2)
      })

      // invalidate the cache
      result.current.clearCachedSuggestions()
      // subsequent call at same time no longer reuses the cache
      await act(async () => {
        // another call at same time -> cache invalid -> API call
        await result.current.suggestRepositories()
        expect(getRepositories).toHaveBeenCalledTimes(3)
      })

      await act(async () => {
        // another call at same time with issue types -> cache invalid -> API call
        await result.current.suggestRepositories({onlyWithIssueTypes: true})
        expect(getRepositories).toHaveBeenCalledTimes(4)
      })
    })
  })
})
