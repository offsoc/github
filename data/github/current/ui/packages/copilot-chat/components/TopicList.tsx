import {debounce} from '@github/mini-throttle'
import {GitHubAvatar} from '@github-ui/github-avatar'
import {getRepositorySearchQuery} from '@github-ui/issue-viewer/Queries'
import {
  RepositoryFragment,
  SearchRepositories,
  TopRepositories,
  TopRepositoriesFragment,
} from '@github-ui/item-picker/RepositoryPicker'
import type {
  RepositoryPickerRepository$data,
  RepositoryPickerRepository$key,
} from '@github-ui/item-picker/RepositoryPickerRepository.graphql'
import type {
  RepositoryPickerSearchRepositoriesQuery,
  RepositoryPickerSearchRepositoriesQuery$data,
} from '@github-ui/item-picker/RepositoryPickerSearchRepositoriesQuery.graphql'
import type {RepositoryPickerTopRepositories$key} from '@github-ui/item-picker/RepositoryPickerTopRepositories.graphql'
import type {RepositoryPickerTopRepositoriesQuery} from '@github-ui/item-picker/RepositoryPickerTopRepositoriesQuery.graphql'
import {Link} from '@github-ui/react-core/link'
import {ArrowRightIcon, CircleSlashIcon, SearchIcon} from '@primer/octicons-react'
import {ActionList, Box, Spinner, Text, TextInput} from '@primer/react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {fetchQuery, readInlineData, useFragment, useRelayEnvironment} from 'react-relay'
import type {Subscription} from 'relay-runtime'

import {copilotChatSearchInputId} from '../utils/constants'
import type {CopilotChatRepo, TopicItem} from '../utils/copilot-chat-types'
import {useChatState} from '../utils/CopilotChatContext'
import {useChatManager} from '../utils/CopilotChatManagerContext'
import {RepoAvatar} from './RepoAvatar'

const UNFILTERED_TOPICS_DISPLAY_COUNT = 4

export default function TopicList() {
  const copilotChatManager = useChatManager()
  const {mode, currentRepository} = useChatState()

  const [filterText, setFilterText] = useState('')
  // Don't send off new filter queries if the user is typing
  const debouncedSetFilter = debounce((newFilter: string) => setFilterText(newFilter), 400, {start: false})

  const [topRepositoryResults, setTopRepositoryResults] = useState<RepositoryPickerTopRepositories$key | undefined>(
    undefined,
  )
  const resetTopRepoResults = useCallback(() => setTopRepositoryResults(undefined), [])

  const onSelect = useCallback(
    async (topic: string | undefined, topicIsDocset?: boolean, repoId?: number) => {
      resetTopRepoResults()
      if (!topic) {
        copilotChatManager.showTopicPicker(false)
        copilotChatManager.clearCurrentTopic()
        copilotChatManager.clearCurrentReferences()
        if (mode === 'immersive') {
          window.history.pushState(null, '', `/copilot`)
        }
        return
      }
      if (topicIsDocset) {
        await copilotChatManager.fetchCurrentDocset(topic)
        copilotChatManager.showTopicPicker(false)
      } else if (repoId !== undefined) {
        await copilotChatManager.fetchCurrentRepo(Number(repoId))
        copilotChatManager.showTopicPicker(false)
      }
    },
    [resetTopRepoResults, copilotChatManager, mode],
  )

  const {repositories, loading: reposLoading} = useRepositoryItems(
    filterText,
    onSelect,
    topRepositoryResults,
    setTopRepositoryResults,
    mode,
    currentRepository,
  )

  const srRepoSearchStatus = useMemo(() => {
    if (reposLoading) return 'Loading repositories'
    if (repositories.length === 0) return 'No repositories found'
    if (repositories.length === 1) return '1 repository found'
    return `${repositories.length} repositories found`
  }, [reposLoading, repositories.length])

  return (
    <Box
      sx={{
        border: '1px solid var(--borderColor-default, var(--color-border-default))',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        mb: 3,
      }}
    >
      <Box sx={{p: 3, pb: 0}}>
        <TextInput
          id={copilotChatSearchInputId}
          leadingVisual={SearchIcon}
          name="topic-search"
          aria-label="Search repositories to chat about"
          placeholder="Search repositories to chat about"
          onChange={e => debouncedSetFilter(e.target.value)}
          sx={{width: '100%', 'input:placeholder-shown': {textOverflow: 'ellipsis'}}}
        />
      </Box>
      <ActionList>
        <div role="status" className="sr-only">
          {srRepoSearchStatus}
        </div>
        {reposLoading ? (
          // Set the height to be the height of 5 repos to avoid layout shift in successful case (should be most common)
          <Box as="li" sx={{display: 'flex', justifyContent: 'center', py: 2, height: '190px', alignItems: 'center'}}>
            <Spinner />
          </Box>
        ) : repositories.length === 0 ? (
          <ActionList.Item disabled>
            <ActionList.LeadingVisual sx={{color: 'fg.muted'}}>
              <CircleSlashIcon />
            </ActionList.LeadingVisual>
            <Text sx={{color: 'fg.muted'}}>No results found</Text>
          </ActionList.Item>
        ) : (
          <>
            {repositories.length > 0 && (
              <ActionList.Group>
                <ActionList.GroupHeading as="h3">Recent repositories</ActionList.GroupHeading>
                {repositories.map(repo => repo.actionItem)}
              </ActionList.Group>
            )}
          </>
        )}
        <ActionList.Divider />
        <ActionList.Item
          key={'chat-with-no-context'}
          id="chat-with-no-context"
          onSelect={() => onSelect(undefined)}
          sx={{'#chat-with-no-context--label': {marginBottom: '0px !important'}}}
        >
          General purpose chat
          <ActionList.TrailingVisual>
            <ArrowRightIcon />
          </ActionList.TrailingVisual>
        </ActionList.Item>
      </ActionList>
    </Box>
  )
}

function useRepositoryItems(
  filterText: string,
  onSelect: (topic: string, isDocset: boolean, repoId: number) => Promise<void>,
  topRepositoryResults: RepositoryPickerTopRepositories$key | undefined,
  setTopRepositoryResults: (results: RepositoryPickerTopRepositories$key | undefined) => void,
  mode: string,
  currentRepository?: CopilotChatRepo,
) {
  const {topRepositoriesCache} = useChatState()

  const chatManager = useChatManager()
  const [repositories, setRepositories] = useState<TopicItem[]>([])
  const [loading, setLoading] = useState<boolean>(!topRepositoriesCache)

  const searchedReposSubscription = useRef<Subscription | undefined>(undefined)
  const relayEnvironment = useRelayEnvironment()

  const topRepositoryFragment = useFragment<RepositoryPickerTopRepositories$key>(
    TopRepositoriesFragment,
    topRepositoryResults ?? null,
  )

  if (topRepositoryFragment && !topRepositoriesCache && !filterText) {
    const {topRepositories} = topRepositoryFragment

    const fetchedRepos = (topRepositories.edges || []).flatMap(a =>
      // eslint-disable-next-line no-restricted-syntax
      a?.node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, a.node)] : [],
    )
    const topReposMapped = getListItemsFromRepos(fetchedRepos, onSelect, mode)

    const {ownerLogin, name} = currentRepository ?? {}
    if (currentRepository && !topReposMapped.find(repo => repo.key === `${ownerLogin}/${name}`)) {
      const topicName = currentRepository.name
      topReposMapped.splice(0, 0, {
        key: topicName,
        actionItem:
          mode === 'workspace' ? (
            <ActionList.LinkItem
              as={Link}
              key={topicName}
              to={`/copilot/r/${topicName}`}
              onClick={() => onSelect(topicName, false, currentRepository.id)}
            >
              <ActionList.LeadingVisual>
                <RepoAvatar
                  ownerLogin={currentRepository.ownerLogin}
                  ownerType={currentRepository.ownerType}
                  size={16}
                />
              </ActionList.LeadingVisual>
              {currentRepository.ownerLogin}/{topicName}
              <ActionList.TrailingVisual>
                <ArrowRightIcon />
              </ActionList.TrailingVisual>
            </ActionList.LinkItem>
          ) : (
            <ActionList.Item key={topicName} onSelect={() => onSelect(topicName, false, currentRepository.id)}>
              <ActionList.LeadingVisual>
                <RepoAvatar
                  ownerLogin={currentRepository.ownerLogin}
                  ownerType={currentRepository.ownerType}
                  size={16}
                />
              </ActionList.LeadingVisual>
              {currentRepository.ownerLogin}/{topicName}
              <ActionList.TrailingVisual>
                <ArrowRightIcon />
              </ActionList.TrailingVisual>
            </ActionList.Item>
          ),
      })
    }
    // setTimeout to prevent a race condition and a warning from React
    // Update TopicList first with the top repositories and then update CopilotChatProvider
    setTimeout(() => chatManager.setTopRepositoryTopics(topReposMapped), 10)
    setLoading(false)
    // We already set the cache so reset the top repos so we stop calling Relay
    setTopRepositoryResults(undefined)
  }

  const fetchTopRepos = useCallback(async () => {
    try {
      const topRepos = await fetchQuery<RepositoryPickerTopRepositoriesQuery>(relayEnvironment, TopRepositories, {
        topRepositoriesFirst: UNFILTERED_TOPICS_DISPLAY_COUNT,
      }).toPromise()
      setTopRepositoryResults(topRepos?.viewer)
    } catch (_) {
      // If we have an error, just silently catch
      // We can't return because we want to use the useFragment hook
      // But we can check for null later
    } finally {
      setLoading(false)
    }
  }, [relayEnvironment, setTopRepositoryResults])

  useEffect(() => {
    void fetchTopRepos()
  }, [fetchTopRepos])

  useEffect(() => {
    const fetchSearchedRepos = async (query: string) => {
      setLoading(true)
      const searchedRepos: RepositoryPickerSearchRepositoriesQuery$data = await new Promise((resolve, reject) => {
        fetchQuery<RepositoryPickerSearchRepositoriesQuery>(relayEnvironment, SearchRepositories, {
          searchQuery: getRepositorySearchQuery(query),
        }).subscribe({
          start: subscription => {
            searchedReposSubscription.current?.unsubscribe()
            searchedReposSubscription.current = subscription
          },
          next: data => {
            resolve(data)
          },
          error: (e: Error) => {
            reject(e)
          },
        })
      })

      const fetchedRepos = (searchedRepos.search.nodes || []).flatMap(node =>
        // eslint-disable-next-line no-restricted-syntax
        node ? [readInlineData<RepositoryPickerRepository$key>(RepositoryFragment, node)] : [],
      )

      setRepositories(fetchedRepos.length ? getListItemsFromRepos(fetchedRepos, onSelect, mode) : [])
      setLoading(false)
    }

    if (filterText) {
      void fetchSearchedRepos(filterText)
    } else if (topRepositoriesCache) {
      setRepositories(topRepositoriesCache)
    }
  }, [filterText, mode, onSelect, relayEnvironment, topRepositoriesCache])

  if (topRepositoriesCache && !filterText) {
    return {repositories: topRepositoriesCache, loading: false}
  }

  return {repositories, loading}
}

function getListItemsFromRepos(
  repos: RepositoryPickerRepository$data[],
  onSelect: (topic: string, isDocset: boolean, repoId: number) => Promise<void>,
  mode: string,
): TopicItem[] {
  return repos.map(({owner: {login, avatarUrl}, isInOrganization, name, databaseId}) => {
    const topicName = `${login}/${name}`
    return {
      key: topicName,
      actionItem:
        mode === 'workspace' ? (
          <ActionList.LinkItem
            as={Link}
            key={topicName}
            to={`/copilot/r/${topicName}`}
            onClick={() => onSelect(topicName, false, databaseId ?? 0)}
          >
            <ActionList.LeadingVisual>
              <GitHubAvatar src={avatarUrl} square={isInOrganization} size={16} />
            </ActionList.LeadingVisual>
            {login}/{name}
            <ActionList.TrailingVisual>
              <ArrowRightIcon />
            </ActionList.TrailingVisual>
          </ActionList.LinkItem>
        ) : (
          <ActionList.Item key={topicName} onSelect={() => onSelect(topicName, false, databaseId ?? 0)}>
            <ActionList.LeadingVisual>
              <GitHubAvatar src={avatarUrl} square={isInOrganization} size={16} />
            </ActionList.LeadingVisual>
            {login}/{name}
            <ActionList.TrailingVisual>
              <ArrowRightIcon />
            </ActionList.TrailingVisual>
          </ActionList.Item>
        ),
    }
  })
}
